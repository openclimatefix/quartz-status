import { Request, Response } from "express";

export const getMockRequestHandlerObjects = () => {
  const req = {} as Request;
  const res = {
    send: jest.fn(),
    redirect: jest.fn(),
    render: jest.fn(),
    status: jest.fn(() => res)
  } as unknown as Response;
  return { req, res };
};
