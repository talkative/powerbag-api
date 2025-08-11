import { Request, Response } from 'express';
import { IStoryLine, StoryLine } from '../models/StoryLine';
import { ErrorResponse } from '../types/response';

export async function getStoryLines(req: Request, res: Response) {
  try {
    const { titles, status = 'preview' } = req.query;

    const query: any = { status };

    if (titles) {
      const titleArray = Array.isArray(titles) ? titles : [titles];
      query.title = { $in: titleArray };
    }

    const stories = await StoryLine.find(query);
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error getting storylines:', error);
    res.status(500).json({
      message: 'Failed to retrieve storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function getStoryLine(req: Request, res: Response) {
  try {
    const { title } = req.params;
    const { status = 'preview' } = req.query;

    const story = await StoryLine.findOne({ title, status });

    if (!story) {
      return res.status(404).json({
        message: 'Storyline not found',
      } as ErrorResponse);
    }

    res.status(200).json(story);
  } catch (error) {
    console.error('Error getting storyline:', error);
    res.status(500).json({
      message: 'Failed to retrieve storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function updateOrCreateStoryLine(req: Request, res: Response) {
  try {
    const storyLineData = req.body;
    const { status = 'preview' } = req.query;

    if (!storyLineData.title) {
      return res.status(400).json({
        message: 'Title is required',
      } as ErrorResponse);
    }

    const currentStoryLine = await StoryLine.findOne({
      title: storyLineData.title,
      status,
    });

    if (currentStoryLine) {
      currentStoryLine.bags = storyLineData.bags;
      currentStoryLine.stories = storyLineData.stories;

      await currentStoryLine.save();
      res.status(200).json(currentStoryLine);
    } else {
      const newStoryLine = await StoryLine.create({
        ...storyLineData,
        title: storyLineData.title,
        status,
      });

      res.status(201).json(newStoryLine);
    }
  } catch (error) {
    console.error('Error updating/creating storyline:', error);
    res.status(500).json({
      message: 'Failed to update or create storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function updateOrCreateStoryLines(req: Request, res: Response) {
  try {
    const storyLines: IStoryLine[] = req.body;
    const { status = 'preview' } = req.query;

    if (!Array.isArray(storyLines)) {
      return res.status(400).json({
        message: 'Request body must be an array of storylines',
      } as ErrorResponse);
    }

    const _storyLines = [];

    for (let index = 0; index < storyLines.length; index++) {
      const storyLine = storyLines[index];

      if (!storyLine || !storyLine.title) continue;

      const currentStoryLine = await StoryLine.findOne({
        title: storyLine.title,
        status,
      });

      if (currentStoryLine) {
        currentStoryLine.bags = storyLine.bags;
        currentStoryLine.stories = storyLine.stories;

        await currentStoryLine.save();
        _storyLines.push(currentStoryLine);
      } else {
        const newStoryLine = await StoryLine.create({
          ...storyLine,
          title: storyLine.title,
          status,
        });

        _storyLines.push(newStoryLine);
      }
    }

    res.status(200).json(_storyLines);
  } catch (error) {
    console.error('Error updating/creating storylines:', error);
    res.status(500).json({
      message: 'Failed to update or create storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function deleteStoryLine(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Storyline ID is required',
      } as ErrorResponse);
    }

    const result = await StoryLine.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Storyline not found',
      } as ErrorResponse);
    }

    res.status(200).json({ message: 'Storyline deleted successfully' });
  } catch (error) {
    console.error('Error deleting storyline:', error);
    res.status(500).json({
      message: 'Failed to delete storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function deleteStoryLines(req: Request, res: Response) {
  try {
    const result = await StoryLine.deleteMany();
    res.status(200).json({
      message: `${result.deletedCount} storylines deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting storylines:', error);
    res.status(500).json({
      message: 'Failed to delete storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function checkIfUpdateAvailable(req: Request, res: Response) {
  try {
    // TODO: Implement update check logic
    res.status(200).json({
      message: 'Update check not implemented yet',
      updateAvailable: false,
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({
      message: 'Failed to check for updates',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function publishStoryLine(req: Request, res: Response) {
  try {
    const { title } = req.params;

    if (!title) {
      return res.status(400).json({
        message: 'Title is required',
      } as ErrorResponse);
    }

    const previewData = await StoryLine.findOne({
      title,
      status: 'preview',
    });

    if (!previewData) {
      return res.status(404).json({
        message: 'Preview data not found',
      } as ErrorResponse);
    }

    const currentPublished = await StoryLine.findOne({
      title: previewData.title,
      status: 'published',
    });

    if (currentPublished) {
      currentPublished.bags = previewData.bags;
      currentPublished.stories = previewData.stories;
      await currentPublished.save();
      res.status(200).json(currentPublished);
    } else {
      const newPublished = await StoryLine.create({
        title: previewData.title,
        bags: previewData.bags,
        stories: previewData.stories,
        status: 'published',
      });
      res.status(201).json(newPublished);
    }
  } catch (error) {
    console.error('Error publishing storyline:', error);
    res.status(500).json({
      message: 'Failed to publish storyline',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function publishStoryLines(req: Request, res: Response) {
  try {
    const previewData = await StoryLine.find({
      status: 'preview',
    });

    if (!previewData || previewData.length === 0) {
      return res.status(404).json({
        message: 'No preview data found',
      } as ErrorResponse);
    }

    const publishedStoryLines = [];

    for (const preview of previewData) {
      const currentPublished = await StoryLine.findOne({
        title: preview.title,
        status: 'published',
      });

      if (currentPublished) {
        currentPublished.bags = preview.bags;
        currentPublished.stories = preview.stories;
        await currentPublished.save();
        publishedStoryLines.push(currentPublished);
      } else {
        const newPublished = await StoryLine.create({
          title: preview.title,
          bags: preview.bags,
          stories: preview.stories,
          status: 'published',
        });
        publishedStoryLines.push(newPublished);
      }
    }

    res.status(200).json(publishedStoryLines);
  } catch (error) {
    console.error('Error publishing storylines:', error);
    res.status(500).json({
      message: 'Failed to publish storylines',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}
