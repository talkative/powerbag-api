import { Request, Response } from 'express';
import { Info } from '../models/Info';
import { ErrorResponse } from '../types/response';

export async function getInfo(req: Request, res: Response) {
  try {
    const info = await Info.findOne();

    if (!info) {
      return res.status(404).json({
        message: 'Info not found',
      } as ErrorResponse);
    }

    res.status(200).json(info);
  } catch (error) {
    console.error('Error getting info:', error);
    res.status(500).json({
      message: 'Failed to retrieve info',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function createInfo(req: Request, res: Response) {
  try {
    const { en, nl } = req.body;

    if (!en || !nl) {
      return res.status(400).json({
        message: 'Both English (en) and Dutch (nl) content are required',
      } as ErrorResponse);
    }

    // Check if info already exists
    const existingInfo = await Info.findOne();
    if (existingInfo) {
      return res.status(400).json({
        message:
          'Info already exists. Use update endpoint to modify existing info.',
      } as ErrorResponse);
    }

    const newInfo = new Info({
      en,
      nl,
    });

    await newInfo.save();
    res.status(201).json(newInfo);
  } catch (error) {
    console.error('Error creating info:', error);
    res.status(500).json({
      message: 'Failed to create info',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}

export async function updateInfo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { en, nl } = req.body;

    if (!en || !nl) {
      return res.status(400).json({
        message: 'Both English (en) and Dutch (nl) content are required',
      } as ErrorResponse);
    }

    const infoToUpdate = await Info.findById(id);

    if (!infoToUpdate) {
      return res.status(404).json({
        message: 'Info not found',
      } as ErrorResponse);
    }

    infoToUpdate.en = en;
    infoToUpdate.nl = nl;

    await infoToUpdate.save();
    res.status(200).json(infoToUpdate);
  } catch (error) {
    console.error('Error updating info:', error);
    res.status(500).json({
      message: 'Failed to update info',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}
