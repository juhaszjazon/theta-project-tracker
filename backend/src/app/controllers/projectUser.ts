import {ProjectUser} from "../models/projectUser";
import {database} from "../../lib/database";
import {Request, Response} from "express";
import {QueryBuilder} from "knex";
import {TableNames} from "../../lib/enums";
import {User} from "../models/user";
import * as userSerializer from '../serializers/user'

export const index = async (req: Request, res: Response) => {
  try {
    let query: QueryBuilder = database(TableNames.users)
      .join(TableNames.projectUsers, 'users.id', '=', 'projectUsers.userId')
      .where({projectId: req.params.projectId, deletedAt: 0}).select();
    if (req.query.limit) {
      query = query.limit(req.query.limit);
    }
    if (req.query.offset) {
      query = query.offset(req.query.offset);
    }
    const users: Array<User> = await query;
    res.status(200).json(userSerializer.index(users));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

};

export const createAndDelete = async (req: Request, res: Response) => {
  try {
    const deletedArray: Array<ProjectUser> = req.body.deleted;
    const createArray: Array<ProjectUser>= req.body.created;
    for (let item of deletedArray) {
      await database(TableNames.projectUsers).where({userId: item.userId, projectId: item.projectId}).delete();
    }
    await database(TableNames.projectUsers).insert(createArray);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
