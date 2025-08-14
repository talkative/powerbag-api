import { Request, Response } from 'express';
import { Events } from '../models/Events';
import type { ISingleEvent } from '../models/Events';
import { ErrorResponse } from '../types/response';

export async function getEvents(req: Request, res: Response) {
  try {
    const events = await Events.find().sort({ createDate: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({
      message: 'Failed to retrieve events',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function createEvents(req: Request, res: Response) {
  return res.status(501).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const eventsData: ISingleEvent[] = req.body;

    if (!Array.isArray(eventsData)) {
      return res.status(400).json({
        message: 'Request body must be an array of events',
      } as ErrorResponse);
    }

    const newEvents = new Events({ data: eventsData });
    await newEvents.save();

    res.status(201).json(newEvents);
  } catch (error) {
    console.error('Error creating events:', error);
    res.status(500).json({
      message: 'Failed to create events',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }

  */
}

export async function deleteEvents(req: Request, res: Response) {
  return res.status(501).json({
    message: 'This endpoint is not implemented yet',
  } as ErrorResponse);

  /*
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Event ID is required',
      } as ErrorResponse);
    }

    const deletedEvent = await Events.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        message: 'Event not found',
      } as ErrorResponse);
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting events:', error);
    res.status(500).json({
      message: 'Failed to delete events',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }

  */
}
