import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient()

const main = async () => {
    const users = await prisma.user.createMany({
        data:[
            {
                name:'IT Tsilavina'
            },
            {
                name:'HSE Andy'
            },
            {
                name:'Comm Mickael'
            },
            {
                name:'Admin Hasina'
            },
            {
                name:'SAQ Maminiaina'
            },
            {
                name:'RH Manou'
            },
            {
                name:'FLEET Nasandratra'
            },
            {
                name:'PM Ihantsa'
            },
            {
                name:'REP Fanah'
            },
            {
                name:'REP Mendrika'
            },
            {
                name:'BE Jenny'
            },
            {
                name:'BE Ricco'
            }
        ]
    })
}

main().then(data => {
    console.log('Données dans la table Users insérées avec succès');
    
})