import { PrismaClient } from "@prisma/client";
import inquirer from "inquirer";

const prisma = new PrismaClient();


interface Student {
  name: string,
  email: string,
  matricula: string,
}


async function createStudantInDB() {
  const novosDados = await createStudent();
  const aluno = await prisma.student.create({
    data: {
      name: novosDados.name,
      email: novosDados.email,
      matricula: novosDados.matricula,
      projects: {

      },
    },
  });
  console.log('Novo estudante criado:', aluno);
}

async function createStudent(): Promise<Student> {
  console.log("Por favor, insira os dados do estudante:");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Qual é o nome do aluno?",
      validate: (input: string) => {
        if (input.trim() === '') {
          return 'O nome não pode ser vazio.';
        }
        return true;
      }
    },
    {
      type: "input",
      name: "email",
      message: "Qual o email do aluno?"
    },
    {
      type: "input",
      name: "enrollment", // Alterado para 'enrollment'
      message: "Qual é a matrícula (enrollment) do aluno?",
    },
  ]);

  const newStudent: Student = {
    name: answers.name,
    email: answers.email,
    matricula: answers.enrollment,
  };

  return newStudent;
}
async function listStudant() {
  const todos = await prisma.student.findMany({
    include: {
      projects: true,
    }
  })
  return todos;
}

async function searchStudants() {
  const { nome } = await inquirer.prompt<{ nome: string }>({
    type: 'input',
    name: 'nome',
    message: 'Digite o nome do estudante:'
  });

  const encontrados = await prisma.student.findMany({
    include: {
      projects: true,
    },
    where: {
      name: nome,

    }
  })
  console.log(encontrados)
}

async function selectStudantID() {

  const todos = await listStudant();

  const { studantID } = await inquirer.prompt<{ studantID: string }>([
    {
      type: 'list',
      name: 'studantID',
      message: 'Selecione um estudante:',
      choices: todos.map(e => ({ name: `${e.name} (${e.email}) - ${e.matricula}`, value: e.id }))
    }
  ]);
  return studantID;
}

async function updateStudant(id: string) {
  const novosDados = await createStudent();

  const alunoUpdate = await prisma.student.update({
    where: {
      id: id,
    },
    data: {
      name: novosDados.name,
      email: novosDados.email,
      matricula: novosDados.matricula,
    }
  })
  console.log("ALuno atualizado:", alunoUpdate);

}

async function main() {
  let loop = true;
  while (loop) {
    const { option } = await inquirer.prompt<{ option: string }>([
      {
        type: 'list',
        name: 'option',
        message: 'O que você deseja fazer?',
        choices: [
          { name: 'Adicionar Novo Estudante', value: 'add' },
          { name: 'Listar Todos os Estudantes', value: 'list' },
          { name: 'Buscar Estudantes (por nome)', value: 'search' },
          { name: 'Atualizar Estudantes', value: 'update' },
          { name: 'Ir para projetos', value: 'projects' },
          new inquirer.Separator(),
          { name: 'Sair', value: 'exit' },
        ],
      },


    ]);

    switch (option) {
      case 'add':
        await createStudantInDB();
        break;
      case 'list':
        const todos = await listStudant();
        console.log(todos)
        break;
      case 'search':
        await searchStudants();
        break;
      case 'update':
        const id = await selectStudantID();
        await updateStudant(id);

        break;
      // case 'projects':
      //   await this.changeEventStatus();
      //   break;
      // case 'register':
      //   await this.registerParticipant();
      //   break;
      case 'exit':
        loop = false;
        console.log("Saindo da aplicação...");
        break;

      default:
        console.log('Opção inválida.');
        break;
    }
  }
}

// async function main() {
//   // const aluno = await prisma.student.create({
//   //   data: {
//   //     name: 'rhanegostoso',
//   //     email: 'rara@gmail.com',
//   //     enrollment: '123041241',
//   //     projects: {
//   //       create: {
//   //         title: 'dando a bunda com peithon',
//   //         description: 'auto explicativo..',
//   //       }
//   //     },
//   //   },
//   // });
//   // console.log('Novo estudante criado:', aluno);
//   // const alunos = await prisma.student.findMany({
//   //   include: {
//   //     projects: true,
//   //   }
//   // });
//
//   // console.log(alunos);
//
//   // const encontrado = await prisma.student.findRaw({
//   //   filter: {
//   //     email: "rara@gmail.com"
//   //   }
//   // })
//   // console.log(encontrado)
//
//
//   // const [projetodeletado, estudandedeletado] = await prisma.$transaction([
//   //   prisma.project.deleteMany({
//   //     where: {
//   //       studentId: "68b98da0a58c13301968bd39"
//   //     }
//   //   }),
//   //   prisma.student.delete({
//   //     where: {
//   //       id: "68b98da0a58c13301968bd39"
//   //     }
//   //   })
//   // ])
//   //
//   // console.log(`Foram deletados ${projetodeletado.count} projetos.`);
//   // console.log('Estudante deletado:', estudandedeletado);
//   //
//   const alunoUpdate = await prisma.student.update({
//     where: {
//       id: "68b9a3c00d35603980b6aa95",
//     },
//     data: {
//       name: "RyanGostoso2",
//     }
//   })
//
//   console.log(alunoUpdate)
//
// }


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Script finalizado.');
  });

