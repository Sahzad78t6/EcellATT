import { eventService } from '../services/event.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createEvent = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const event = await eventService.createEvent(req.body, req.user, ip);
  return ApiResponse.created(res, event, 'Event created successfully');
});

export const updateEvent = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const event = await eventService.updateEvent(req.params.id, req.body, req.user, ip);
  return ApiResponse.success(res, event, 'Event updated successfully');
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  return ApiResponse.success(res, event, 'Event retrieved successfully');
});

export const listEvents = asyncHandler(async (req, res) => {
  const events = await eventService.listEvents(req.query);
  return ApiResponse.success(res, events, 'Events retrieved successfully');
});

export const openEvent = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const event = await eventService.openEvent(req.params.id, req.user, ip);
  return ApiResponse.success(res, event, 'Event attendance window opened');
});

export const closeEvent = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const event = await eventService.closeEvent(req.params.id, req.user, ip);
  return ApiResponse.success(res, event, 'Event closed, unmarked members marked absent, and alerts evaluated.');
});

export const reopenEvent = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const event = await eventService.reopenEvent(req.params.id, req.user, ip);
  return ApiResponse.success(res, event, 'Event attendance window reopened');
});

export const cancelEvent = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const event = await eventService.cancelEvent(req.params.id, req.user, ip);
  return ApiResponse.success(res, event, 'Event cancelled successfully');
});
