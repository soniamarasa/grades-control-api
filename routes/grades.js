import express from 'express';
import { promises as fs, read } from 'fs';

const router = express.Router();

router.post('/createGrade', async (req, res, next) => {
  try {
    let grade = req.body;

    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      !grade.value == null
    ) {
      throw new Error('Student, Subject, Type e Value são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(global.fileName));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await fs.writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);
  } catch (err) {
    next(err);
  }
});

router.put('/alterGrade', async (req, res, next) => {
  try {
    let grade = req.body;

    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      !grade.value == null
    ) {
      throw new Error('Student, Subject, Type e Value são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(global.fileName));
    const index = data.grades.findIndex((a) => a.id === grade.id);

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;

    await fs.writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);
  } catch (err) {
    next(err);
  }
});

router.delete('/deleteGrade/:id', async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error('Id é obrigatório');
    }

    const data = JSON.parse(await fs.readFile(global.fileName));
    const response = data.grades.filter(
      (a) => a.id === parseInt(req.params.id)
    );

    if (response.length === 0) {
      throw new Error('Registro não encontrado');
    }

    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );

    await fs.writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send('Registro exclúido com sucesso!');
  } catch (err) {
    next(err);
  }
});

router.get('/getGrade/:id', async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error('Id é obrigatório');
    }

    const data = JSON.parse(await fs.readFile(global.fileName));
    const result = data.grades.filter(
      (grade) => grade.id === parseInt(req.params.id)
    );

    if (result.length === 0) {
      throw new Error('Registro não encontrado');
    }

    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.get('/getStudentGrade/', async (req, res, next) => {
  try {
    let obj = req.body;
    let sum = 0;

    if (!obj.student || !obj.subject) {
      throw new Error('Student e Subjects são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(global.fileName));
    const response = data.grades.filter(
      (grade) => grade.subject === obj.subject && grade.student === obj.student
    );

    if (response.length === 0) {
      throw new Error('Registro não encontrado');
    }

    response.forEach((grade) => (sum += grade.value));

    res.send('Soma total das notas do(a) aluno(a) ' + obj.student + ': ' + sum);
  } catch (err) {
    next(err);
  }
});

router.get('/getSubjectTypeAverage/', async (req, res, next) => {
  try {
    let obj = req.body;
    let sum = 0;
    let average = 0;

    if (!obj.type || !obj.subject) {
      throw new Error('Type e Subject são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(global.fileName));
    const response = data.grades.filter(
      (grade) => grade.subject === obj.subject && grade.type === obj.type
    );

    if (response.length === 0) {
      throw new Error('Registro não encontrado');
    }

    response.forEach((grade) => (sum += grade.value));
    average = sum / response.length;

    res.send(
      'Média da matéria ' +
        obj.subject +
        ' do tipo ' +
        obj.type +
        ': ' +
        average
    );
  } catch (err) {
    next(err);
  }
});

router.get('/getThreeBestGrades', async (req, res, next) => {
  try {
    let obj = req.body;

    if (!obj.type || !obj.subject) {
      throw new Error('Type e Subject são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(global.fileName));
    const response = data.grades
      .filter(
        (grade) => grade.subject === obj.subject && grade.type === obj.type
      )
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    if (response.length === 0) {
      throw new Error('Registro não encontrado');
    }

    res.send(response);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  res.status(400).send({ error: err.message });
});

export default router;
