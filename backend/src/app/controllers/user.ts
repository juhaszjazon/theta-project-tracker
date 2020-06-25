import {User} from "../models/user";
import {database} from "../../lib/database";
import {Request, Response} from "express";
import * as userSerializer from '../serializers/user';
import * as bcrypt from 'bcrypt';
import {QueryBuilder} from "knex";
import {Roles, TableNames} from "../../lib/enums";
import {ProjectUser} from "../models/projectUser";
import {createUser} from "../serializers/userCreate";

export const index = async (req: Request, res: Response) => {
  let query: QueryBuilder = database(TableNames.users).select().whereNull('deletedAt');
  if (req.query.limit) {
    query = query.limit(req.query.limit);
  }
  if (req.query.offset) {
    query = query.offset(req.query.offset);
  }
  const users: Array<User> = await query;
  res.status(200).json(userSerializer.index(users));
}

export const show = async (req: Request, res: Response) => {
  try {
     const user = await database(TableNames.users).select().where({id: req.params.id}).whereNull('deletedAt').first();
    if (user) {
      res.status(200).json(userSerializer.show(user));
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

const createProjects = async (req: Request) => {
  const projects: Array<ProjectUser> = req.body.projects;
  let projectsToSave: Array<ProjectUser> = [];
  const user: User = await database(TableNames.users).select()
    .where({email: req.body.user.email}).first();
  const userId: number = user.id;
  if (projects.length > 0) {
    for (let project of projects) {
      projectsToSave.push(
        {
          userId: userId,
          projectId: project.projectId,
          costToClientPerHour: project.costToClientPerHour
        }
      );
    }
    await database(TableNames.projectUsers).insert(projectsToSave);
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const encryptedPassword = bcrypt.hashSync(req.body.user.password, 10);
    const user = createUser(req.body.user, encryptedPassword);
    await database(TableNames.users).insert(user);
    await createProjects(req);
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    let id: number;
    if (res.locals.user.role !== Roles.admin) {
      id = res.locals.user.id;
    } else {
      id = +req.params.id;
    }
    const user: User = await database(TableNames.users).select().where({id}).first();
    if (user) {
      const encryptedPassword = bcrypt.hashSync(req.body.user.password, 10);
      const newUser = createUser(req.body.user, encryptedPassword);
      await database(TableNames.users).update(newUser).where({id});
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export const destroy = async (req: Request, res: Response) => {
  try {
    const user: User = await database(TableNames.users).select().where({id: req.params.id}).first();
    if (user) {
      await database(TableNames.projectUsers).update('deletedAt', database.raw('CURRENT_TIMESTAMP')).where({userId: req.params.id});
      await database(TableNames.users).update('deletedAt', database.raw('CURRENT_TIMESTAMP')).where({id: req.params.id});
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}