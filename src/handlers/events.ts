import { Request, Response } from 'express';
import { Events } from '../models/Events';
import type { ISingleEvent } from '../models/Events';
import { ErrorResponse } from '../types/response';
import { HTTP_STATUS } from '../constants/httpStatusCodes';

export async function getEvents(req: Request, res: Response) {
  try {
    const events = await Events.find().sort({ createDate: -1 });
    res.status(HTTP_STATUS.OK).json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve events',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function createEvents(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const eventsData: ISingleEvent[] = req.body;

    if (!Array.isArray(eventsData)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Request body must be an array of events',
      } as ErrorResponse);
    }

    const newEvents = new Events({ data: eventsData });
    await newEvents.save();

    res.status(HTTP_STATUS.CREATED).json(newEvents);
  } catch (error) {
    console.error('Error creating events:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create events',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }

  */
}

export async function deleteEvents(req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Event ID is required',
      } as ErrorResponse);
    }

    const deletedEvent = await Events.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Event not found',
      } as ErrorResponse);
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting events:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to delete events',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }

  */
}
