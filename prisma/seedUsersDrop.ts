import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient()

const main = async () => {
    await prisma.user.deleteMany()
}

main().then(data => {
    console.log('Table Users vidée avec succès')
})