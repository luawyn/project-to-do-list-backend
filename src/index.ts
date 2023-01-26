import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database/knex";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`);
});

/* ---------------------------- USERS ---------------------------- */

app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await db("users");
    res.status(200).send({ Users: result });
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

    const [findId] = await db("users").where({ id: id });
    const [findEmail] = await db("users").where({ email: email });

    if (findId) {
      res.status(400);
      throw new Error("'id' indisponível");
    }

    if (findEmail) {
      res.status(400);
      throw new Error("'E-mail' indisponível");
    }

    if (typeof id !== "string" && id.length < 1) {
      res.status(400);
      throw new Error(
        "'id' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }

    if (typeof name !== "string" && name.length < 1) {
      res.status(400);
      throw new Error(
        "'name' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }
    if (typeof email !== "string" && email.length < 1) {
      res.status(400);
      throw new Error(
        "'email' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }
    if (typeof password !== "string" && password.length < 1) {
      res.status(400);
      throw new Error(
        "'password' inválido, deve ser string e deve possuir pelo menos 1 caractere"
      );
    }

    const newUser = {
      id: id,
      name: name,
      email: email,
      password: password,
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
    const id = req.params.id;

    if (!id) {
      res.status(400);
      throw new Error("'id' não encontrado");
    }

    const findId = await db("users").where({ id: id });

    if (findId) {
      await db("users").del().where({ id: id });
      res.status(200).send("Usuário deletado com sucesso!");
    } else {
      res.status(404);
      throw new Error("'id' não encontrada.");
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

/* ---------------------------- TASKS ---------------------------- */
