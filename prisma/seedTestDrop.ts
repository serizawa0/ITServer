import { ChildProcess } from "node:child_process";
import { PrismaClient } from "../src/generated/prisma";
import { SubTask } from "../interfaces/TaskInterfaces";

const prisma = new PrismaClient()


const main = async () => {
    await prisma.task.deleteMany()
}
main().then( data => {
    console.log('Fin du test getTasks !')
})