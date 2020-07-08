import {Router} from 'express';
import {router as loginRouter} from './login';
import {router as userRouter} from './user';
import {router as milestoneRouter} from './milestone';
import {router as clientRouter} from './client';
import {router as projectRouter} from './project';
import {router as projectUserRouter} from './projectUser';
import {router as userProjectRouter} from './userProject';
import {router as timeRecordRouter} from './timeRecord';
import {router as actionLabelRouter} from './actionLabel';
import {router as reportRouter} from './report';
import {router as userProfileRouter} from './userProfile';
import {router as overtimeMultiplierRouter} from './overtimeMultiplier';
import {router as projectMilestoneRouter} from "./projectMilestone";
import {router as calendarRouter} from "./calendar";
import {router as projectActionLabelRouter} from "./projectActionLabel";
import {router as timeRecordCopyRouter} from "./timeRecordCopy";
import {router as exportRouter} from "./export";

export const router: Router = Router({mergeParams: true});
router.use('/login', loginRouter);
router.use('/user/profile', userProfileRouter)
router.use('/user/:userId/project', userProjectRouter);
router.use('/user', userRouter);
router.use('/client', clientRouter);
router.use('/project/:projectId/milestone', projectMilestoneRouter);
router.use('/project/:projectId/actionLabel', projectActionLabelRouter);
router.use('/project', projectRouter);
router.use('/milestone', milestoneRouter);
router.use('/project/user', projectUserRouter);
router.use('/timeRecord/copy', timeRecordCopyRouter);
router.use('/timeRecord', timeRecordRouter);
router.use('/actionLabel', actionLabelRouter);
router.use('/report', reportRouter);
router.use('/overtimeMultiplier', overtimeMultiplierRouter);
router.use('/calendar', calendarRouter);
router.use('/export', exportRouter);
