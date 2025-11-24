import { Request, Response } from 'express';
import { IStoryline, Storyline } from '../models/Storyline';
import { Collection } from '../models/Collection';
import { ImageAsset, VideoAsset, AudioAsset } from '../models/Asset';
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

    let stories;

    if (status === 'preview') {
      // For preview storylines, populate asset references with selected fields
      stories = await Storyline.find(query)
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
            select: 'url originalName duration format',
          },
        ])
        .sort({ createDate: -1 });
    } else {
      stories = await Storyline.find(query).sort({ createDate: -1 });
    }

    res.status(HTTP_STATUS.OK).json({ success: true, data: stories });
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

    const story = await Storyline.findById(id).populate([
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

export async function migrateStoryline(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Find the storyline with populated collections
    const storyline = await Storyline.findById(id);

    if (!storyline) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Storyline not found',
      } as ErrorResponse);
    }

    let migratedAssets = 0;
    let updatedLocations = 0;

    // Get collection IDs for location tracking
    const collectionIds = storyline.collections.join(', ');
    const locationInfo = `${collectionIds}:${storyline._id}`;

    // Migrate bags and update ImageAsset locations
    for (const columnName of [
      'firstColumn',
      'secondColumn',
      'thirdColumn',
    ] as const) {
      const column = storyline.bags[columnName];

      for (const bag of column) {
        // If bag has an imageAsset reference, update its location
        if (bag.imageAsset) {
          const imageAsset = await ImageAsset.findById(bag.imageAsset);
          if (imageAsset) {
            // Add location if it doesn't already exist
            if (!imageAsset.location.includes(locationInfo)) {
              imageAsset.location.push(locationInfo);
              await imageAsset.save();
              updatedLocations++;
              console.log(
                `Added location to ImageAsset ${imageAsset._id}: ${locationInfo}`
              );
            }
          }
        } else {
          // Try to find matching imageAsset by filename pattern (legacy migration)
          // const imageAsset = await ImageAsset.findOne({
          //   originalName: `${bag.id}_image.png`,
          // });
          // if (imageAsset) {
          //   bag.imageAsset = imageAsset._id;
          //   migratedAssets++;
          //   // Add location tracking
          //   if (!imageAsset.location.includes(locationInfo)) {
          //     imageAsset.location.push(locationInfo);
          //     await imageAsset.save();
          //     updatedLocations++;
          //   }
          //   console.log(
          //     `Migrated and added location for bag ${bag.id} -> ImageAsset ${imageAsset._id}`
          //   );
          // }
        }
      }
    }

    // Migrate stories and update AudioAsset locations (if needed)
    // for (const story of storyline.stories) {
    //   if (!story.audioAsset) {
    //     const audioAsset = await AudioAsset.findOne({
    //       originalName: `${story.id}_audio.mp3`,
    //     });

    //     if (audioAsset) {
    //       story.audioAsset = audioAsset._id;
    //       migratedAssets++;
    //       console.log(
    //         `Migrated story ${story.id} -> AudioAsset ${audioAsset._id}`
    //       );
    //     }
    //   }
    // }

    await storyline.save();

    return res.status(HTTP_STATUS.OK).json({
      message: 'Migration completed successfully',
      details: {
        migratedAssets,
        updatedLocations,
        storylineId: storyline._id,
        storylineTitle: storyline.title,
        locationInfo,
      },
    });
  } catch (error) {
    console.error('Error migrating storyline:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to migrate storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function deleteStoryline(req: Request, res: Response) {
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

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Storyline deleted successfully' });
  } catch (error) {
    console.error('Error deleting storyline:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to delete storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
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
    const existingStoryline = await Storyline.findOne({
      title,
      collections: { $in: [collectionId] },
    });

    if (existingStoryline) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: 'Storyline with this title already exists in this collection',
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

// Then create a helper function to resolve names when displaying
export const resolveLocationNames = async (req: Request, res: Response) => {
  try {
    const { assetId, locations } = req.body;

    if (!locations || !Array.isArray(locations)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Locations array is required in request body',
      } as ErrorResponse);
    }

    if (locations.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Locations array cannot be empty',
      } as ErrorResponse);
    }

    const results = [];

    for (const location of locations) {
      if (typeof location !== 'string') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: 'Each location must be a string',
        } as ErrorResponse);
      }

      const [collectionId, storylineId] = location.split(':');

      if (!collectionId || !storylineId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: `Invalid location format: "${location}". Expected format: collectionId:storylineId`,
        } as ErrorResponse);
      }

      const collection = await Collection.findById(collectionId);
      const storyline = await Storyline.findById(storylineId);

      if (!collection || !storyline) {
        let assetModel;

        if (assetId) {
          assetModel =
            (await ImageAsset.findById(assetId)) ||
            (await AudioAsset.findById(assetId)) ||
            (await VideoAsset.findById(assetId));
        }

        if (assetModel) {
          // Remove this invalid location from the asset
          console.log(
            `Removing invalid location "${location}" from asset ${assetModel._id}`
          );
          const updatedLocations = assetModel.location.filter(
            (loc) => loc !== location
          );
          assetModel.location = updatedLocations;

          await assetModel.save();
          console.log(
            `Updated asset ${assetModel._id} locations: ${updatedLocations.join(
              ', '
            )}`
          );

          continue; // Skip adding to results since it's invalid
        }
      }

      const result = {
        originalLocation: location,
        collectionId,
        storylineId,
        collectionName: collection?.name || 'Unknown Collection',
        storylineName: storyline?.title || 'Unknown Storyline',
        displayText: `${collection?.name || 'Unknown Collection'} / ${
          storyline?.title || 'Unknown Storyline'
        }`,
      };

      results.push(result);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error resolving location names:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to resolve location names',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
};

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
        collections: { $in: existingStoryline.collections },
      });

      if (titleConflict) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          message: 'Storyline with this title already exists',
        } as ErrorResponse);
      }
    }

    Object.assign(existingStoryline, updateData);

    const updatedStoryline = await existingStoryline.save();

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
