import { Request, Response } from 'express';
import { Collection, ICollection } from '../models/Collection';
import { Storyline } from '../models/Storyline';
import { ErrorResponse } from '../types/response';
import { HTTP_STATUS } from '../constants/httpStatusCodes';

export async function getCollections(req: Request, res: Response) {
  try {
    const { status = 'preview' } = req.query;

    const collections = await Collection.find({ status }).sort({
      createDate: -1,
    });

    res.status(HTTP_STATUS.OK).json(collections);
  } catch (error) {
    console.error('Error getting collections:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve collections',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function getCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status = 'preview', includeStorylines = 'false' } = req.query;

    const collection = await Collection.findOne({ _id: id, status });

    if (!collection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Collection not found',
      } as ErrorResponse);
    }

    let result: any = collection.toObject();

    // Optionally include storylines that belong to this collection
    if (includeStorylines === 'true') {
      const storylines = await Storyline.find({
        collections: id,
        status,
      });

      result.storylines = storylines;
    }

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    console.error('Error getting collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function createCollection(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const status = 'preview'; // Always create as preview first

    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Collection name is required',
      } as ErrorResponse);
    }

    // Check if collection with this name already exists in preview
    const existingCollection = await Collection.findOne({ name, status });
    if (existingCollection) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Collection with this name already exists in preview',
      } as ErrorResponse);
    }

    const newCollection = new Collection({
      name,
      description: description || '',
      status,
    });

    const savedCollection = await newCollection.save();

    res.status(HTTP_STATUS.CREATED).json(savedCollection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function updateCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const status = 'preview'; // Only allow updating preview collections

    const collection = await Collection.findOne({ _id: id, status });
    if (!collection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    // Update collection
    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;

    await collection.save();

    res.status(HTTP_STATUS.OK).json(collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function deleteCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const query: any = { _id: id };
    if (status) {
      query.status = status;
    }

    const result = await Collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Collection not found',
      } as ErrorResponse);
    }

    // Remove collection reference from all storylines
    await Storyline.updateMany(
      { collections: id },
      { $pull: { collections: id } }
    );

    res.status(HTTP_STATUS.OK).json({
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to delete collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function addStorylineToCollection(req: Request, res: Response) {
  try {
    const { collectionId, storylineId } = req.params;
    const status = 'preview'; // Only work with preview versions

    const [collection, storyline] = await Promise.all([
      Collection.findOne({ _id: collectionId, status }),
      Storyline.findOne({ _id: storylineId, status }),
    ]);

    if (!collection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    if (!storyline) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview storyline not found',
      } as ErrorResponse);
    }

    // Check if collection is already in storyline
    if (storyline.collections.includes(collectionId as any)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Storyline is already in this collection',
      } as ErrorResponse);
    }

    // Add collection to storyline
    await Storyline.updateOne(
      { _id: storylineId },
      { $addToSet: { collections: collectionId } }
    );

    res.status(HTTP_STATUS.OK).json({
      message: 'Storyline added to collection successfully',
      collectionId,
      storylineId,
    });
  } catch (error) {
    console.error('Error adding storyline to collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to add storyline to collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function removeStorylineFromCollection(
  req: Request,
  res: Response
) {
  try {
    const { collectionId, storylineId } = req.params;
    const status = 'preview'; // Only work with preview versions

    const collection = await Collection.findOne({ _id: collectionId, status });

    if (!collection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    // Remove collection from storyline
    await Storyline.updateOne(
      { _id: storylineId },
      { $pull: { collections: collectionId } }
    );

    res.status(HTTP_STATUS.OK).json({
      message: 'Storyline removed from collection successfully',
      collectionId,
      storylineId,
    });
  } catch (error) {
    console.error('Error removing storyline from collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to remove storyline from collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function publishCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get the preview version
    const previewCollection = await Collection.findOne({
      _id: id,
      status: 'preview',
    });

    if (!previewCollection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    // Check if published version already exists
    const existingPublished = await Collection.findOne({
      name: previewCollection.name,
      status: 'published',
    });

    if (existingPublished) {
      // Update existing published version with preview data
      existingPublished.description = previewCollection.description || '';

      await existingPublished.save();
      res.status(HTTP_STATUS.OK).json(existingPublished);
    } else {
      // Create new published version by copying preview
      const publishedCollection = await Collection.create({
        name: previewCollection.name,
        description: previewCollection.description,
        status: 'published',
      });

      res.status(HTTP_STATUS.CREATED).json(publishedCollection);
    }
  } catch (error) {
    console.error('Error publishing collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to publish collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function publishAllCollections(req: Request, res: Response) {
  try {
    const previewCollections = await Collection.find({ status: 'preview' });

    if (!previewCollections || previewCollections.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'No preview collections found',
      } as ErrorResponse);
    }

    const publishedCollections = [];

    for (const preview of previewCollections) {
      const existingPublished = await Collection.findOne({
        name: preview.name,
        status: 'published',
      });

      if (existingPublished) {
        existingPublished.description = preview.description || '';

        await existingPublished.save();
        publishedCollections.push(existingPublished);
      } else {
        const publishedCollection = await Collection.create({
          name: preview.name,
          description: preview.description,
          status: 'published',
        });

        publishedCollections.push(publishedCollection);
      }
    }

    res.status(HTTP_STATUS.OK).json(publishedCollections);
  } catch (error) {
    console.error('Error publishing all collections:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to publish all collections',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}
