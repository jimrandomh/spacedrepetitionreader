import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import cronParser from 'cron-parser';
import { getPrisma } from '../db';

type CronjobContext = {
  db: PrismaClient
  intendedAt: Date
}
interface Cronjob {
  name: string
  scheduleStr: string
  fn: (context: CronjobContext)=>Promise<void>
}

const cronjobs: Record<string,Cronjob> = {};

export function registerCronjob({name, schedule, fn}: {
  name: string
  schedule: string
  fn: (context: CronjobContext)=>Promise<void>
}) {
  if (name in cronjobs) {
    throw new Error("Cronjob names must be unique");
  }
  cronjobs[name] = {
    name,
    scheduleStr: schedule,
    fn,
  };
  
  scheduleCronjob(name);
}

function scheduleCronjob(name: string) {
  const schedule = cronjobs[name].scheduleStr;
  const parsedSchedule = cronParser.parseExpression(schedule)
  const nextExecution = parsedSchedule.next().toDate();
  const now = new Date();
  setTimeout(() => {
    void checkCronjob(name, nextExecution);
  }, nextExecution.getTime()-now.getTime());
}

async function checkCronjob(name: string, intendedAt: Date) {
  const cronjob = cronjobs[name];
  const intendedAtMs = intendedAt.getTime();
  const db = getPrisma();
  const executionKey = `${name}_${intendedAtMs}`;
  setTimeout(() => scheduleCronjob(name), 1000);
  
  try {
    // Create a cronHistory entry. If this job is already started at the same
    // time, this will throw a unique-constraint violation, which is how we
    // know another server is handling the same job.
    await db.cronHistory.create({
      data: {
        key: executionKey,
        intendedAt: intendedAtMs,
        startedAt: new Date(),
        finishedAt: null,
      },
    });

    console.log(`Running cronjob ${executionKey}`);
    
    try {
      await cronjob.fn({db, intendedAt});
    
      await db.cronHistory.update({
        where: { key: executionKey },
        data: { finishedAt: new Date() },
      });
    } catch(e) {
      await db.cronHistory.update({
        where: { key: executionKey },
        data: {
          finishedAt: new Date(),
          error: e.toString(),
        },
      });
    }
  } catch(e) {
    if (
      e instanceof PrismaClientKnownRequestError
      && e.code === 'P2002'
    ) {
      // Unique constraint failed (expected error; means some other server
      // is handling this cronjob)
      console.log(`Skipping duplicate execution of ${executionKey}`);
    } else {
      // Something other than a unique constraint error - something's wrong,
      // rethrow.
      throw e;
    }
  }
}
