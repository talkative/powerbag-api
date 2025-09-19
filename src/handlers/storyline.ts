import { Request, Response } from 'express';
import { IStoryline, Storyline } from '../models/Storyline';
import { Collection } from '../models/Collection';
import {
  CreateStorylineDto,
  UpdateStorylineDto,
} from '../dtos/CreateStoryline.dto';
import { ErrorResponse } from '../types/response';
import { HTTP_STATUS } from '../constants/httpStatusCodes';

export async function getStorylines(req: Request, res: Response) {
  try {
    const { titles, status = 'preview' } = req.query;

    const query: any = { status };

    if (titles) {
      const titleArray = Array.isArray(titles) ? titles : [titles];
      query.title = { $in: titleArray };
    }

    const stories = await Storyline.find(query);
    res.status(HTTP_STATUS.OK).json(stories);
  } catch (error) {
    console.error('Error getting storylines:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function getStoryline(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const story = await Storyline.findById(id);

    if (!story) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Storyline not found',
      } as ErrorResponse);
    }

    res.status(HTTP_STATUS.OK).json(story);
  } catch (error) {
    console.error('Error getting storyline:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function deleteStoryline(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Storyline ID is required',
      } as ErrorResponse);
    }

    const result = await Storyline.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Storyline not found',
      } as ErrorResponse);
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Storyline deleted successfully' });
  } catch (error) {
    console.error('Error deleting storyline:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to delete storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
  */
}

export async function deleteStorylines(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const result = await Storyline.deleteMany();
    res.status(HTTP_STATUS.OK).json({
      message: `${result.deletedCount} storylines deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting storylines:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to delete storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
  */
}

export async function checkIfUpdateAvailable(req: Request, res: Response) {
  try {
    // TODO: Implement update check logic
    res.status(HTTP_STATUS.OK).json({
      message: 'Update check not implemented yet',
      updateAvailable: false,
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to check for updates',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function publishStoryline(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const { title } = req.params;

    if (!title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Title is required',
      } as ErrorResponse);
    }

    const previewData = await Storyline.findOne({
      title,
      status: 'preview',
    });

    if (!previewData) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview data not found',
      } as ErrorResponse);
    }

    const currentPublished = await Storyline.findOne({
      title: previewData.title,
      status: 'published',
    });

    if (currentPublished) {
      currentPublished.bags = previewData.bags;
      currentPublished.stories = previewData.stories;
      await currentPublished.save();
      res.status(HTTP_STATUS.OK).json(currentPublished);
    } else {
      const newPublished = await Storyline.create({
        title: previewData.title,
        bags: previewData.bags,
        stories: previewData.stories,
        status: 'published',
      });
      res.status(HTTP_STATUS.CREATED).json(newPublished);
    }
  } catch (error) {
    console.error('Error publishing storyline:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to publish storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
  */
}

export async function publishStorylines(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const previewData = await Storyline.find({
      status: 'preview',
    });

    if (!previewData || previewData.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'No preview data found',
      } as ErrorResponse);
    }

    const publishedStorylines = [];

    for (const preview of previewData) {
      const currentPublished = await Storyline.findOne({
        title: preview.title,
        status: 'published',
      });

      if (currentPublished) {
        currentPublished.bags = preview.bags;
        currentPublished.stories = preview.stories;
        await currentPublished.save();
        publishedStorylines.push(currentPublished);
      } else {
        const newPublished = await Storyline.create({
          title: preview.title,
          bags: preview.bags,
          stories: preview.stories,
          status: 'published',
        });
        publishedStorylines.push(newPublished);
      }
    }

    res.status(HTTP_STATUS.OK).json(publishedStorylines);
  } catch (error) {
    console.error('Error publishing storylines:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to publish storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
  */
}

export async function createStoryline(req: Request, res: Response) {
  try {
    const { title, collectionId, bags, stories }: CreateStorylineDto = req.body;

    // Validate required fields
    if (!title || !collectionId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Title and collectionId are required',
      } as ErrorResponse);
    }

    // Check if collection exists
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Collection not found',
      } as ErrorResponse);
    }

    // Check if storyline with same title already exists
    const existingStoryline = await Storyline.findOne({ title });
    if (existingStoryline) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: 'Storyline with this title already exists',
      } as ErrorResponse);
    }

    // Create new storyline
    const newStoryline = new Storyline({
      title,
      status: 'preview', // Default to preview
      collections: [collectionId],
      bags: bags || {
        firstColumn: [],
        secondColumn: [],
        thirdColumn: [],
      },
      stories: stories || [],
    });

    const savedStoryline = await newStoryline.save();

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Storyline created successfully',
      data: savedStoryline,
    });
  } catch (error) {
    console.error('Error creating storyline:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function updateStoryline(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData: UpdateStorylineDto = req.body;

    // Check if storyline exists
    const existingStoryline = await Storyline.findById(id);

    if (!existingStoryline) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Storyline not found',
      } as ErrorResponse);
    }

    // If title is being updated, check for conflicts
    if (updateData.title && updateData.title !== existingStoryline.title) {
      const titleConflict = await Storyline.findOne({
        title: updateData.title,
        _id: { $ne: id },
      });

      if (titleConflict) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          message: 'Storyline with this title already exists',
        } as ErrorResponse);
      }
    }

    // Update storyline
    const updatedStoryline = await Storyline.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(HTTP_STATUS.OK).json({
      message: 'Storyline updated successfully',
      data: updatedStoryline,
    });
  } catch (error) {
    console.error('Error updating storyline:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}
