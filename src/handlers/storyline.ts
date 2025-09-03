import { Request, Response } from 'express';
import { IStoryline, Storyline } from '../models/Storyline';
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
    const { title } = req.params;
    const { status = 'preview' } = req.query;

    const story = await Storyline.findOne({ title, status });

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

export async function updateOrCreateStoryline(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);
  /*
  try {
    const storylineData = req.body;
    const { status = 'preview' } = req.query;

    if (!storylineData.title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Title is required',
      } as ErrorResponse);
    }

    const currentStoryline = await Storyline.findOne({
      title: storylineData.title,
      status,
    });

    if (currentStoryline) {
      currentStoryline.bags = storylineData.bags;
      currentStoryline.stories = storylineData.stories;

      await currentStoryline.save();
      res.status(HTTP_STATUS.OK).json(currentStoryline);
    } else {
      const newStoryline = await Storyline.create({
        ...storylineData,
        title: storylineData.title,
        status,
      });

      res.status(HTTP_STATUS.CREATED).json(newStoryline);
    }
  } catch (error) {
    console.error('Error updating/creating storyline:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update or create storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
  */
}

export async function updateOrCreateStorylines(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const storylines: IStoryline[] = req.body;
    const { status = 'preview' } = req.query;

    if (!Array.isArray(storylines)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Request body must be an array of storylines',
      } as ErrorResponse);
    }

    const _storylines = [];

    for (let index = 0; index < storylines.length; index++) {
      const storyline = storylines[index];

      if (!storyline || !storyline.title) continue;

      const currentStoryline = await Storyline.findOne({
        title: storyline.title,
        status,
      });

      if (currentStoryline) {
        currentStoryline.bags = storyline.bags;
        currentStoryline.stories = storyline.stories;

        await currentStoryline.save();
        _storylines.push(currentStoryline);
      } else {
        const newStoryline = await Storyline.create({
          ...storyline,
          title: storyline.title,
          status,
        });

        _storylines.push(newStoryline);
      }
    }

    res.status(HTTP_STATUS.OK).json(_storylines);
  } catch (error) {
    console.error('Error updating/creating storylines:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update or create storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
  */
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
