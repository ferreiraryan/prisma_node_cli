import { PrismaClient } from "@prisma/client";
import inquirer from "inquirer";

const prisma = new PrismaClient();

interface StudentData {
  name: string;
  email: string;
  matricula: string;
}

async function getStudentData(studentIdToIgnore?: string): Promise<StudentData> {
  console.log("\nPor favor, insira os dados do estudante:");

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
      message: "Qual o email do aluno?",
      validate: async (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return 'Por favor, insira um email válido.';
        }
        const existingStudent = await prisma.student.findUnique({
          where: { email: input },
        });
        if (existingStudent && existingStudent.id !== studentIdToIgnore) {
          return 'Este email já está em uso.';
        }
        return true;
      }
    },
    {
      type: "input",
      name: "matricula",
      message: "Qual é a matrícula do aluno?",
      validate: async (input: string) => {
        if (input.trim() === '') {
          return 'A matrícula não pode ser vazia.';
        }
        const existingStudent = await prisma.student.findUnique({
          where: { matricula: input },
        });
        if (existingStudent && existingStudent.id !== studentIdToIgnore) {
          return 'Esta matrícula já está em uso.';
        }
        return true;
      }
    },
  ]);

  return answers;
}

async function createStudentInDB() {
  try {
    const studentData = await getStudentData();
    const student = await prisma.student.create({
      data: studentData,
    });
    console.log('\nNovo estudante criado com sucesso:', student);
  } catch (error) {
    console.error("\nErro ao criar estudante:", error);
  }
}

async function listStudents() {
  const students = await prisma.student.findMany({
    include: {
      projects: true,
    }
  });

  if (students.length === 0) {
    console.log("\nℹ️ Nenhum estudante encontrado.");
    return;
  }

  console.log("\n--- Lista de Estudantes ---");
  console.table(students.map(s => ({
    ID: s.id,
    Nome: s.name,
    Email: s.email,
    Matrícula: s.matricula,
    Projetos: s.projects.length
  })));
  console.log("---------------------------\n");
}

async function searchStudents() {
  const { name } = await inquirer.prompt<{ name: string }>({
    type: 'input',
    name: 'name',
    message: 'Digite o nome (ou parte do nome) do estudante para buscar:',
    validate: input => input.trim() !== '' || 'Por favor, digite um nome para a busca.'
  });

  const foundStudents = await prisma.student.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      }
    },
    include: {
      projects: true,
    }
  });

  if (foundStudents.length === 0) {
    console.log(`\nℹ️ Nenhum estudante encontrado com o nome "${name}".`);
    return;
  }

  console.log(`\n--- Resultados da Busca por "${name}" ---`);
  console.table(foundStudents.map(s => ({
    ID: s.id,
    Nome: s.name,
    Email: s.email,
    Matrícula: s.matricula,
  })));
  console.log("------------------------------------------\n");
}

async function selectStudentID(): Promise<string | null> {
  const allStudents = await prisma.student.findMany();

  if (allStudents.length === 0) {
    console.log("\nℹ️ Não há estudantes cadastrados para selecionar.");
    return null;
  }

  const { studentID } = await inquirer.prompt<{ studentID: string }>([
    {
      type: 'list',
      name: 'studentID',
      message: 'Selecione um estudante:',
      choices: allStudents.map(e => ({
        name: `${e.name} (Matrícula: ${e.matricula})`,
        value: e.id
      })),
      loop: false,
    }
  ]);
  return studentID;
}

async function updateStudent(id: string) {
  try {
    const studentData = await getStudentData(id);
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: studentData,
    });
    console.log("\n Aluno atualizado com sucesso:", updatedStudent);
  } catch (error) {
    console.error("\nErro ao atualizar estudante. Verifique se o ID está correto.");
  }
}

async function deleteStudent(id: string) {
  try {
    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Tem certeza que deseja remover este estudante? Esta ação não pode ser desfeita.',
        default: false,
      }
    ]);

    if (confirm) {
      await prisma.student.delete({
        where: { id },
      });
      console.log("\n Estudante removido com sucesso.");
    } else {
      console.log("\nℹ️ Remoção cancelada.");
    }
  } catch (error) {
    console.error("\nErro ao remover estudante. Verifique se o ID está correto.");
  }
}

async function addProjectToStudent() {
  const studentId = await selectStudentID();
  if (!studentId) return;

  try {
    const projectData = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Qual é o título do projeto?',
        validate: input => input.trim() !== '' || 'O título não pode ser vazio.'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Digite uma descrição para o projeto (opcional):'
      }
    ]);

    const newProject = await prisma.project.create({
      data: {
        title: projectData.title,
        description: projectData.description,
        studentId: studentId,
      }
    });
    console.log('\n Projeto adicionado com sucesso:', newProject);
  } catch (error) {
    console.error('\nErro ao adicionar projeto:', error);
  }
}

async function listStudentProjects() {
  const studentId = await selectStudentID();
  if (!studentId) return;

  try {
    const studentWithProjects = await prisma.student.findUnique({
      where: { id: studentId },
      include: { projects: true }
    });

    if (!studentWithProjects) {
      console.log("\nEstudante não encontrado.");
      return;
    }

    if (studentWithProjects.projects.length === 0) {
      console.log(`\nℹ️ O estudante ${studentWithProjects.name} não possui projetos.`);
      return;
    }

    console.log(`\n--- Projetos de ${studentWithProjects.name} ---`);
    console.table(studentWithProjects.projects.map(p => ({
      ID: p.id,
      Título: p.title,
      Descrição: p.description
    })));
    console.log("-------------------------------------------\n");

  } catch (error) {
    console.error('\nErro ao listar projetos:', error);
  }
}

async function removeProjectFromStudent() {
  const studentId = await selectStudentID();
  if (!studentId) return;

  try {
    const studentWithProjects = await prisma.student.findUnique({
      where: { id: studentId },
      include: { projects: true }
    });

    if (!studentWithProjects || studentWithProjects.projects.length === 0) {
      console.log(`\nℹ️ O estudante selecionado não possui projetos para remover.`);
      return;
    }

    const { projectIdToDelete } = await inquirer.prompt<{ projectIdToDelete: string }>([
      {
        type: 'list',
        name: 'projectIdToDelete',
        message: 'Selecione o projeto que deseja remover:',
        choices: studentWithProjects.projects.map(p => ({
          name: `${p.title}`,
          value: p.id
        })),
        loop: false,
      }
    ]);

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Tem certeza que deseja remover este projeto?',
        default: false,
      }
    ]);

    if (confirm) {
      await prisma.project.delete({
        where: { id: projectIdToDelete }
      });
      console.log('\nProjeto removido com sucesso.');
    } else {
      console.log('\nℹ️ Remoção cancelada.');
    }

  } catch (error) {
    console.error('\nErro ao remover projeto. Verifique se o ID está correto.');
  }
}

async function projectMenu() {
  let loop = true;
  while (loop) {
    const { option } = await inquirer.prompt<{ option: string }>([
      {
        type: 'list',
        name: 'option',
        message: 'Gerenciamento de Projetos',
        choices: [
          { name: 'Adicionar Projeto a um Estudante', value: 'addProject' },
          { name: 'Listar Projetos de um Estudante', value: 'listProjects' },
          { name: 'Remover Projeto de um Estudante', value: 'removeProject' },
          new inquirer.Separator(),
          { name: 'Voltar ao Menu Principal', value: 'back' },
        ],
        loop: false,
      },
    ]);

    switch (option) {
      case 'addProject':
        await addProjectToStudent();
        break;
      case 'listProjects':
        await listStudentProjects();
        break;
      case 'removeProject':
        await removeProjectFromStudent();
        break;
      case 'back':
        loop = false;
        break;
      default:
        console.log('Opção inválida.');
        break;
    }
  }
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
          { name: 'Atualizar Estudante', value: 'update' },
          { name: 'Remover Estudante', value: 'delete' },
          { name: 'Gerenciar Projetos', value: 'projects' },
          new inquirer.Separator(),
          { name: 'Sair', value: 'exit' },
        ],
        loop: false,
      },
    ]);

    switch (option) {
      case 'add':
        await createStudentInDB();
        break;
      case 'list':
        await listStudents();
        break;
      case 'search':
        await searchStudents();
        break;
      case 'update':
        const idToUpdate = await selectStudentID();
        if (idToUpdate) {
          await updateStudent(idToUpdate);
        }
        break;
      case 'delete':
        const idToDelete = await selectStudentID();
        if (idToDelete) {
          await deleteStudent(idToDelete);
        }
        break;
      case 'projects':
        await projectMenu();
        break;
      case 'exit':
        loop = false;
        console.log("\nSaindo da aplicação...");
        break;
      default:
        console.log('Opção inválida.');
        break;
    }
  }
}

main()
  .catch((e) => {
    console.error("Um erro inesperado ocorreu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Script finalizado.');
  });


