import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database/knex";
import { TTaskDB, TUserDB } from "./types";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`);
});

/* ---------------------------- USERS ---------------------------- */

app.get("/users", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string | undefined;

    if (searchTerm === undefined) {
      const result = await db("users");
      res.status(200).send({ Users: result });
    } else {
      const result = await db("users").where("name", "LIKE", `%${searchTerm}%`);
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post("/users", async (req: Request, res: Response) => {
  try {
    const { id, name, email, password } = req.body;
    const [userIdAlreadyExists]: TUserDB[] | undefined[] = await db(
      "users"
    ).where({ id });
    const [userEmailAlreadyExists]: TUserDB[] | undefined[] = await db(
      "users"
    ).where({ email });

    if (userIdAlreadyExists) {
      res.status(400);
      throw new Error("'id' indisponível");
    }

    if (userEmailAlreadyExists) {
      res.status(400);
      throw new Error("'E-mail' indisponível");
    }

    if (typeof id !== "string" || id.length < 1) {
      res.status(400);
      throw new Error(
        "'id' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }

    if (typeof name !== "string" || name.length < 1) {
      res.status(400);
      throw new Error(
        "'name' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }
    if (typeof email !== "string" || email.length < 1) {
      res.status(400);
      throw new Error(
        "'email' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
      )
    ) {
      throw new Error(
        "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial"
      );
    }

    const newUser: TUserDB = {
      id,
      name,
      email,
      password,
    };
    await db("users").insert(newUser);
    res.status(200).send("Usuário criado com sucesso!");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    const [userIdToDelete]: TUserDB[] | undefined[] = await db("users").where({
      id: idToDelete,
    });
    if (!userIdToDelete) {
      res.status(400);
      throw new Error("'id' não encontrada");
    }

    await db("users_tasks").del().where({ user_id: idToDelete });
    await db("users").del().where({ id: idToDelete });

    res.status(200).send("User deletado com sucesso");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

/* ---------------------------- TASKS ---------------------------- */

app.get("/tasks", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string | undefined;

    if (searchTerm === undefined) {
      const result = await db("tasks");
      res.status(200).send({ Tasks: result });
    } else {
      const result = await db("tasks")
        .where("title", "LIKE", `%${searchTerm}%`)
        .orWhere("description", "LIKE", `%${searchTerm}%`);
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post("/tasks", async (req: Request, res: Response) => {
  try {
    const { id, title, description } = req.body;

    const [taskIdAlreasyExist]: TTaskDB[] | undefined[] = await db(
      "tasks"
    ).where({ id });

    if (taskIdAlreasyExist) {
      res.status(400);
      throw new Error("'id' indisponível.");
    }

    if (typeof id !== "string" || id.length < 1) {
      res.status(400);
      throw new Error(
        "'id' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }

    if (typeof title !== "string" || title.length < 1) {
      res.status(400);
      throw new Error(
        "'title' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }

    if (typeof description !== "string" || description.length < 1) {
      res.status(400);
      throw new Error(
        "'description' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }

    const newTask = {
      id,
      title,
      description,
    };

    await db("tasks").insert(newTask);
    res.status(200).send("Task criada com sucesso!");
  } catch (error) {
    console.log(error);
    if (req.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.put("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const idToUpdate = req.params.id;
    const newId = req.body.id;
    const newTitle = req.body.title;
    const newDescription = req.body.description;
    const newCreatedAt = req.body.createdAt;
    const newStatus = req.body.status;
    const [taskIdToUpdate]: TTaskDB[] | undefined[] = await db("tasks").where({
      id: idToUpdate,
    });
    if (!taskIdToUpdate) {
      res.status(400);
      throw new Error("'id' não encontrada");
    }
    if (newId !== undefined) {
      if (typeof newId !== "string" || newId.length < 1) {
        res.status(400);
        throw new Error(
          "'id' inválido, deve ser string e deve possuir pelo menos 1 caractere"
        );
      }
    }

    if (newTitle !== undefined) {
      if (typeof newTitle !== "string" || newTitle.length < 1) {
        res.status(400);
        throw new Error(
          "'title' inválido, deve ser string e deve possuir pelo menos 1 caractere"
        );
      }
    }

    if (newDescription !== undefined) {
      if (typeof newDescription !== "string" || newDescription.length < 1) {
        res.status(400);
        throw new Error(
          "'description' inválido, deve ser string e deve possuir pelo menos 1 caractere"
        );
      }
    }

    if (newStatus !== undefined) {
      if (newStatus > 1) {
        res.status(400);
        throw new Error(
          "'status' inválido, deve ser number e deve ser 0 ou 1 (incompleto ou completo)"
        );
      }
    }

    const newTask: TTaskDB = {
      id: newId || taskIdToUpdate.id,
      title: newTitle || taskIdToUpdate.title,
      description: newDescription || taskIdToUpdate.description,
      created_at: newCreatedAt || taskIdToUpdate.created_at,
      status: isNaN(newStatus) ? taskIdToUpdate.status : newStatus,
    };

    await db("tasks").update(newTask).where({ id: idToUpdate });
    res.status(200).send("Task editada com sucesso");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.delete("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;
    const [taskIdToDelete]: TTaskDB[] | undefined[] = await db("tasks").where({
      id: idToDelete,
    });

    if (!taskIdToDelete) {
      res.status(400);
      throw new Error("'id' não encontrado");
    }
    await db("users_tasks").del().where({ task_id: idToDelete });
    await db("tasks").del().where({ id: idToDelete });
    res.status(200).send("Task deletada com sucesso");
  } catch (error) {
    console.log(error);
    if (req.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});
