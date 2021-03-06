import {Client} from "../models/client";
import {database} from "../../lib/database";
import {Request, Response} from "express";
import {QueryBuilder} from "knex";
import {TableNames} from "../../lib/enums";
import * as clientSerializer from "../serializers/client";

export const index = async (req: Request, res: Response) => {
  let query: QueryBuilder = database(TableNames.clients).select().where({deletedAt: 0});
  if (req.query.limit) {
    query = query.limit(req.query.limit);
  }
  if (req.query.offset) {
    query = query.offset(req.query.offset);
  }
  const clients: Array<Client> = await query;
  res.status(200).json(clients);
};

export const show = async (req: Request, res: Response) => {
  try {
    const client: Client = await database(TableNames.clients).select().where({id: req.params.id}).where({deletedAt: 0}).first();
    if (client) {
      res.status(200).json(client);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const duplicate: Client = await database(TableNames.clients).select().where({name: req.body.name}).first();
    if (duplicate) {
      res.sendStatus(400);
    } else {
      const client: Client = clientSerializer.create(req);
      await database(TableNames.clients).insert(client);
      res.sendStatus(201);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const client: Client = await database(TableNames.clients).select().where({id: req.params.id}).where({deletedAt: 0}).first();
    if (client) {
      const newClient: Client = clientSerializer.create(req);
      await database(TableNames.clients).update(newClient).where({id: req.params.id});
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const destroy = async (req: Request, res: Response) => {
  try {
    const client: Client = await database(TableNames.clients).select().where({id: req.params.id}).first();
    if (client) {
      await database(TableNames.clients).update(clientSerializer.destroy(client)).where({id: req.params.id});
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}
