import { ChildProcess } from "node:child_process";
import { PrismaClient } from "../src/generated/prisma";
import { SubTask } from "../interfaces/TaskInterfaces";

const prisma = new PrismaClient()

type SubTaskNode = {
  id: string;
  title: string;
  done: boolean;
  taskId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: SubTaskNode[];
};

async function getSubTaskTree(parentId: string | null, taskId: string): Promise<SubTaskNode[]> {
  const subTasks = await prisma.subTask.findMany({
    where: {
      taskId,
      parentId,
    },
  });

  const children = await Promise.all(
    subTasks.map(async (sub) => ({
      ...sub,
      children: await getSubTaskTree(sub.id, taskId),
    }))
  );

  return children;
}

async function getTaskWithSubTasks(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) return null;

  const subTasks = await getSubTaskTree(null, taskId);

  return {
    ...task,
    subTasks,
  };
}

const main = async () => {
    const tasks = await prisma.task.findMany()
    if(tasks){
        tasks.forEach(element => {
            const taskTree = getTaskWithSubTasks(element.id)
            console.log(taskTree);
        });
    }
}
main().then( data => {
    console.log('Fin du test getTasks !')
})