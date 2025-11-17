import { Request, Response } from 'express';
import { Collection, ICollection } from '../models/Collection';
import { Storyline, IStoryline } from '../models/Storyline';
import { ErrorResponse, AuthenticatedRequest } from '../types/response';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import mongoose from 'mongoose';

import { User } from '../models/User';

export async function getCollections(req: Request, res: Response) {
  try {
    const { status = 'preview', includeLastUpdatedContent = 'false' } =
      req.query;

    const collections = await Collection.find({ status }).sort({
      createDate: -1,
    });

    // If includeLastUpdatedContent is requested, fetch the latest storyline update for each collection
    if (includeLastUpdatedContent === 'true') {
      const collectionsWithContent = await Promise.all(
        collections.map(async (collection) => {
          // Find the most recently updated storyline in this collection
          const latestStoryline = await Storyline.findOne({
            collections: collection._id,
            status,
          })
            .sort({ updateDate: -1 })
            .select('updateDate')
            .lean();

          return {
            ...collection.toObject(),
            lastUpdatedContent: latestStoryline?.updateDate || null,
          };
        })
      );

      return res.status(HTTP_STATUS.OK).json(collectionsWithContent);
    }

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
    const {
      status = 'preview',
      includeStorylines = 'false',
      includeLastUpdatedContent = 'false',
    } = req.query;

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
      })
        .sort({ updateDate: -1 }) // Sort by most recently updated
        .populate([
          {
            path: 'bags.firstColumn.imageAsset',
            select: 'url originalName',
          },
          {
            path: 'bags.secondColumn.imageAsset',
            select: 'url originalName',
          },
          {
            path: 'bags.thirdColumn.imageAsset',
            select: 'url originalName',
          },
          {
            path: 'stories.audioAsset',
            select: 'url originalName duration',
          },
          {
            path: 'stories.events.videoAsset',
            select: 'url originalName format',
          },
        ]);

      result.storylines = storylines;

      // If we're including storylines and they want lastUpdatedContent, use the first storyline's updateDate
      if (includeLastUpdatedContent === 'true' && storylines[0]) {
        result.lastUpdatedContent = storylines[0].updateDate;
      }
    } else if (includeLastUpdatedContent === 'true') {
      // If not including full storylines but want lastUpdatedContent, just get the latest updateDate
      const latestStoryline = await Storyline.findOne({
        collections: id,
        status,
      })
        .sort({ updateDate: -1 })
        .select('updateDate')
        .lean();

      result.lastUpdatedContent = latestStoryline?.updateDate || null;
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

export async function createCollection(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { name, description } = req.body;
    const status = 'preview'; // Always create as preview first
    const userId = req.user?._id; // Get user ID from authenticated request

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: 'User authentication required',
      } as ErrorResponse);
    }

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
      createdBy: userId,
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

export async function duplicateCollection(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { includeStorylines = 'true' } = req.query;
    const userId = req.user?._id; // Get user ID

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: 'User authentication required',
      } as ErrorResponse);
    }

    // Find the original collection to duplicate
    const originalCollection = await Collection.findOne({
      _id: id,
      status: 'preview', // Only duplicate preview collections
    });

    if (!originalCollection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    // Generate a unique name for the duplicate
    const duplicateName = await generateUniqueDuplicateName(
      originalCollection.name
    );

    // Create the duplicate collection
    const duplicateCollection = new Collection({
      name: duplicateName,
      description: originalCollection.description,
      status: 'preview',
      createdBy: userId,
    });

    const savedDuplicateCollection = await duplicateCollection.save();
    const duplicatedStorylines = [];

    // Optionally duplicate storylines as well
    if (includeStorylines === 'true') {
      // Get all storylines from the original collection
      const originalStorylines = await Storyline.find({
        collections: { $in: [id] },
        status: 'preview',
      });

      // Duplicate each storyline and add to the new collection
      for (const originalStoryline of originalStorylines) {
        const duplicateStoryline = new Storyline({
          title: originalStoryline.title, // Keep the same title
          bags: originalStoryline.bags, // Deep copy of bags data
          stories: originalStoryline.stories, // Deep copy of stories data
          collections: [savedDuplicateCollection._id], // Assign to new collection
          status: 'preview',
        });

        const savedStoryline = await duplicateStoryline.save();
        duplicatedStorylines.push(savedStoryline);
      }
    }

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Collection duplicated successfully',
      data: {
        originalCollection: {
          _id: originalCollection._id,
          name: originalCollection.name,
        },
        duplicatedCollection: savedDuplicateCollection,
        duplicatedStorylines: {
          count: duplicatedStorylines.length,
          storylines: duplicatedStorylines,
        },
      },
    });
  } catch (error) {
    console.error('Error duplicating collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to duplicate collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

// Add this migration function to your collections.ts file

export async function migrateCollectionsCreatedBy(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: 'User authentication required',
      } as ErrorResponse);
    }

    // Check if user is admin/superadmin (migration should be restricted)
    if (
      !req.user?.roles.includes('admin') &&
      !req.user?.roles.includes('superadmin')
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: 'Only admins can run migrations',
      } as ErrorResponse);
    }

    // const { defaultUserId } = req.body;

    const defaultUserId = userId;

    if (!defaultUserId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'defaultUserId is required in request body',
        example: {
          defaultUserId: '64f123456789abcdef123456',
        },
      } as ErrorResponse);
    }

    // Validate that the default user exists

    const defaultUser = await User.findById(defaultUserId);

    if (!defaultUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Default user not found',
      } as ErrorResponse);
    }

    let totalMigrated = 0;
    const migrationResults = {
      preview: { migrated: 0, errors: [] as any[] },
      published: { migrated: 0, errors: [] as any[] },
    };

    // Migrate Preview Collections
    try {
      const previewCollections = await Collection.find({
        status: 'preview',
        $or: [
          { createdBy: { $exists: false } }, // Collections without createdBy field
          { createdBy: null }, // Collections with null createdBy
        ],
      });

      console.log(
        `Found ${previewCollections.length} preview collections to migrate`
      );

      for (const collection of previewCollections) {
        try {
          await Collection.findByIdAndUpdate(
            collection._id,
            { createdBy: defaultUserId },
            { runValidators: true }
          );

          migrationResults.preview.migrated++;
          totalMigrated++;

          console.log(
            `Migrated preview collection: ${collection._id} - ${collection.name}`
          );
        } catch (error) {
          console.error(
            `Error migrating preview collection ${collection._id}:`,
            error
          );
          migrationResults.preview.errors.push({
            id: collection._id,
            name: collection.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching preview collections for migration:', error);
    }

    // Migrate Published Collections
    try {
      const publishedCollections = await Collection.find({
        status: 'published',
        $or: [{ createdBy: { $exists: false } }, { createdBy: null }],
      });

      console.log(
        `Found ${publishedCollections.length} published collections to migrate`
      );

      for (const collection of publishedCollections) {
        try {
          await Collection.findByIdAndUpdate(
            collection._id,
            { createdBy: defaultUserId },
            { runValidators: true }
          );

          migrationResults.published.migrated++;
          totalMigrated++;

          console.log(
            `Migrated published collection: ${collection._id} - ${collection.name}`
          );
        } catch (error) {
          console.error(
            `Error migrating published collection ${collection._id}:`,
            error
          );
          migrationResults.published.errors.push({
            id: collection._id,
            name: collection.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error(
        'Error fetching published collections for migration:',
        error
      );
    }

    // Calculate total errors
    const totalErrors =
      migrationResults.preview.errors.length +
      migrationResults.published.errors.length;

    res.status(HTTP_STATUS.OK).json({
      message: `Collection createdBy migration completed. Migrated ${totalMigrated} collections with ${totalErrors} errors.`,
      data: {
        totalMigrated,
        totalErrors,
        defaultUser: {
          _id: defaultUser._id,
          name: defaultUser.name || defaultUser.email,
          email: defaultUser.email,
        },
        migrationResults,
        summary: {
          preview: `${migrationResults.preview.migrated} migrated, ${migrationResults.preview.errors.length} errors`,
          published: `${migrationResults.published.migrated} migrated, ${migrationResults.published.errors.length} errors`,
        },
      },
    });
  } catch (error) {
    console.error('Error running collection createdBy migration:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to run collection createdBy migration',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

// Helper function to generate unique duplicate name for collections
async function generateUniqueDuplicateName(
  originalName: string
): Promise<string> {
  let counter = 1;
  let duplicateName = `${originalName} (${counter})`;

  // Keep incrementing until we find a name that doesn't exist
  while (await Collection.findOne({ name: duplicateName, status: 'preview' })) {
    counter++;
    duplicateName = `${originalName} (${counter})`;
  }

  return duplicateName;
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

    const previewCollection = await Collection.findOne({
      _id: id,
      status: 'preview',
    });

    if (!previewCollection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    // Get all storylines that belong to this collection
    const previewStorylines = await Storyline.find({
      collections: id,
      status: 'preview',
    });

    let publishedCollection;
    let publishedStorylines = [];

    // Check if published version already exists by previewVersionId
    const existingPublished = await Collection.findOne({
      previewVersionId: id,
      status: 'published',
    });

    if (existingPublished) {
      // Update existing published collection
      existingPublished.name = previewCollection.name;
      existingPublished.description = previewCollection.description || '';
      existingPublished.publishedDate = new Date();

      await existingPublished.save();
      publishedCollection = existingPublished;
    } else {
      // Create new published collection
      publishedCollection = new Collection({
        name: previewCollection.name,
        description: previewCollection.description,
        status: 'published',
        previewVersionId: previewCollection._id, // Link back to preview
        publishedDate: new Date(),
      });

      await publishedCollection.save();
    }

    // Publish all storylines in this collection
    for (const previewStoryline of previewStorylines) {
      // Check if published version of this storyline already exists
      const existingPublishedStoryline = await Storyline.findOne({
        previewVersionId: previewStoryline._id,
        status: 'published',
      });

      if (existingPublishedStoryline) {
        // Update existing published storyline
        existingPublishedStoryline.title = previewStoryline.title;
        existingPublishedStoryline.bags = previewStoryline.bags;
        existingPublishedStoryline.stories = previewStoryline.stories;

        // Update collections to reference the published collection
        // Update the line that's causing the error:
        existingPublishedStoryline.collections = [
          publishedCollection._id as mongoose.Types.ObjectId,
        ];

        await existingPublishedStoryline.save();
        publishedStorylines.push(existingPublishedStoryline);
      } else {
        // Create new published storyline
        const publishedStoryline = new Storyline({
          title: previewStoryline.title,
          bags: previewStoryline.bags,
          stories: previewStoryline.stories,
          collections: [publishedCollection._id], // Reference the published collection
          status: 'published',
          previewVersionId: previewStoryline._id, // Link back to preview
        });

        await publishedStoryline.save();
        publishedStorylines.push(publishedStoryline);
      }
    }

    // Mark the preview collection with publishedDate
    previewCollection.publishedDate = new Date();
    await previewCollection.save();

    res.status(HTTP_STATUS.OK).json({
      message: 'Collection and storylines published successfully',
      collection: publishedCollection,
      publishedStorylines: publishedStorylines.length,
      storylines: publishedStorylines,
    });
  } catch (error) {
    console.error('Error publishing collection:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to publish collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

// Add this new function to your collections handler
export async function compareCollectionVersions(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get the preview collection
    const previewCollection = await Collection.findOne({
      _id: id,
      status: 'preview',
    });

    if (!previewCollection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    // Get the published version (if it exists)
    const publishedCollection = await Collection.findOne({
      previewVersionId: id,
      status: 'published',
    });

    // Get all preview storylines in this collection
    const previewStorylines = await Storyline.find({
      collections: { $in: [id] },
      status: 'preview',
    }).sort({ title: 1 });

    // Get all published storylines (if published collection exists)
    let publishedStorylines: IStoryline[] = [];

    if (publishedCollection) {
      publishedStorylines = await Storyline.find({
        collections: { $in: [publishedCollection._id] },
        status: 'published',
      }).sort({ title: 1 });
    }

    // Collection comparison
    const collectionChanges = {
      hasChanges: false,
      changes: [] as string[],
    };

    if (!publishedCollection) {
      collectionChanges.hasChanges = true;
      collectionChanges.changes.push('Collection has never been published');
    } else {
      if (previewCollection.name !== publishedCollection.name) {
        collectionChanges.hasChanges = true;
        collectionChanges.changes.push(
          `Name changed: "${publishedCollection.name}" → "${previewCollection.name}"`
        );
      }
      if (previewCollection.description !== publishedCollection.description) {
        collectionChanges.hasChanges = true;
        collectionChanges.changes.push(`Description changed`);
      }
    }

    // Storyline comparison
    const storylineComparison = {
      newStorylines: [] as any[],
      modifiedStorylines: [] as any[],
      unchangedStorylines: [] as any[],
      removedStorylines: [] as any[],
    };

    // Check each preview storyline
    for (const previewStoryline of previewStorylines) {
      const matchingPublished = publishedStorylines.find(
        (ps) =>
          ps.previewVersionId?.toString() === previewStoryline._id?.toString()
      );

      if (!matchingPublished) {
        // New storyline that doesn't exist in published version
        storylineComparison.newStorylines.push({
          _id: previewStoryline._id,
          title: previewStoryline.title,
          lastModified: previewStoryline.updateDate,
        });
      } else {
        // Compare the storylines to see if they've changed
        const changes = compareStorylineContent(
          previewStoryline,
          matchingPublished
        );

        if (changes.length > 0) {
          storylineComparison.modifiedStorylines.push({
            _id: previewStoryline._id,
            title: previewStoryline.title,
            publishedTitle: matchingPublished.title,
            lastModified: previewStoryline.updateDate,
            lastPublished: matchingPublished.updateDate,
            changes: changes,
          });
        } else {
          storylineComparison.unchangedStorylines.push({
            _id: previewStoryline._id,
            title: previewStoryline.title,
            lastModified: previewStoryline.updateDate,
            lastPublished: matchingPublished.updateDate,
          });
        }
      }
    }

    // Check for removed storylines (exist in published but not in preview)
    if (publishedCollection) {
      for (const publishedStoryline of publishedStorylines) {
        const stillExists = previewStorylines.find(
          (ps) =>
            ps._id?.toString() ===
            publishedStoryline.previewVersionId?.toString()
        );

        if (!stillExists) {
          storylineComparison.removedStorylines.push({
            _id: publishedStoryline._id,
            title: publishedStoryline.title,
            previewVersionId: publishedStoryline.previewVersionId,
          });
        }
      }
    }

    // Determine if publishing is recommended
    const needsPublishing =
      collectionChanges.hasChanges ||
      storylineComparison.newStorylines.length > 0 ||
      storylineComparison.modifiedStorylines.length > 0 ||
      storylineComparison.removedStorylines.length > 0;

    // Summary statistics
    const summary = {
      needsPublishing,
      lastPublished: previewCollection.publishedDate,
      totalPreviewStorylines: previewStorylines.length,
      totalPublishedStorylines: publishedStorylines.length,
      newStorylines: storylineComparison.newStorylines.length,
      modifiedStorylines: storylineComparison.modifiedStorylines.length,
      unchangedStorylines: storylineComparison.unchangedStorylines.length,
      removedStorylines: storylineComparison.removedStorylines.length,
    };

    res.status(HTTP_STATUS.OK).json({
      message: 'Collection versions compared successfully',
      collection: {
        preview: {
          _id: previewCollection._id,
          name: previewCollection.name,
          description: previewCollection.description,
          lastModified: previewCollection.updateDate,
          publishedDate: previewCollection.publishedDate,
        },
        published: publishedCollection
          ? {
              _id: publishedCollection._id,
              name: publishedCollection.name,
              description: publishedCollection.description,
              lastModified: publishedCollection.updateDate,
            }
          : null,
      },
      collectionChanges,
      storylines: storylineComparison,
      summary,
    });
  } catch (error) {
    console.error('Error comparing collection versions:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to compare collection versions',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

// Helper function to compare storyline content
function compareStorylineContent(preview: any, published: any): string[] {
  const changes: string[] = [];

  // Compare basic fields
  if (preview.title !== published.title) {
    changes.push(`Title: "${published.title}" → "${preview.title}"`);
  }

  // Compare bags
  if (JSON.stringify(preview.bags) !== JSON.stringify(published.bags)) {
    changes.push('Bags content modified');
  }

  // Compare stories
  if (JSON.stringify(preview.stories) !== JSON.stringify(published.stories)) {
    changes.push('Stories content modified');
  }

  // Check if preview was modified after published version
  if (preview.updateDate > published.updateDate) {
    changes.push('Preview version newer than published');
  }

  return changes;
}

// Add a simpler endpoint to just check if publishing is needed
export async function checkPublishingStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const previewCollection = await Collection.findOne({
      _id: id,
      status: 'preview',
    });

    if (!previewCollection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Preview collection not found',
      } as ErrorResponse);
    }

    const publishedCollection = await Collection.findOne({
      previewVersionId: id,
      status: 'published',
    });

    // Quick check: if never published, definitely needs publishing
    if (!publishedCollection) {
      return res.status(HTTP_STATUS.OK).json({
        needsPublishing: true,
        reason: 'Collection has never been published',
        lastPublished: null,
      });
    }

    // Check if collection itself has changes
    const collectionHasChanges =
      previewCollection.name !== publishedCollection.name ||
      previewCollection.description !== publishedCollection.description;

    if (collectionHasChanges) {
      return res.status(HTTP_STATUS.OK).json({
        needsPublishing: true,
        reason: 'Collection details have changed',
        lastPublished: previewCollection.publishedDate,
      });
    }

    // Check storylines modification dates
    const previewStorylines = await Storyline.find({
      collections: { $in: [id] },
      status: 'preview',
    }).select('_id updateDate');

    const publishedStorylines = await Storyline.find({
      collections: { $in: [publishedCollection._id] },
      status: 'published',
    }).select('_id updateDate previewVersionId');

    // Check for new or modified storylines
    let hasChanges = false;
    let changeReason = '';

    // Different number of storylines
    if (previewStorylines.length !== publishedStorylines.length) {
      hasChanges = true;
      changeReason = 'Number of storylines has changed';
    } else {
      // Check if any preview storyline is newer than its published version
      for (const previewStoryline of previewStorylines) {
        const matchingPublished = publishedStorylines.find(
          (ps) =>
            ps.previewVersionId?.toString() === previewStoryline._id?.toString()
        );

        if (!matchingPublished) {
          hasChanges = true;
          changeReason = 'New storyline(s) found';
          break;
        }

        if (previewStoryline.updateDate > matchingPublished.updateDate) {
          hasChanges = true;
          changeReason = 'Storyline(s) have been modified';
          break;
        }
      }
    }

    res.status(HTTP_STATUS.OK).json({
      needsPublishing: hasChanges,
      reason: hasChanges ? changeReason : 'No changes detected',
      lastPublished: previewCollection.publishedDate,
      previewStorylines: previewStorylines.length,
      publishedStorylines: publishedStorylines.length,
    });
  } catch (error) {
    console.error('Error checking publishing status:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to check publishing status',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}
