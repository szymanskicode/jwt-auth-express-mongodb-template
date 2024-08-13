import express, { Request, Response } from "express";

import auth from "../middleware/auth";
import Post from "../models/post";

import { checkErrors } from "../utils/validators/checkErrors";
import { ValidationErrors } from "../types";

const router = express.Router();

///////////////////////
///// CREATE POST /////
///////////////////////
router.post("/api/posts", auth, async (req: Request, res: Response) => {
  try {
    const post = new Post({
      ...req.body,
      owner: req.user._id,
    });

    console.log(post);

    await post.save();

    return res.status(201).send({ post });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

//////////////////////
///// READ POSTS /////
//////////////////////
router.get("/api/posts", async (req: Request, res: Response) => {
  try {
    const posts = await Post.find();

    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

/////////////////////////
///// READ POSTS ME /////
/////////////////////////
// GET /api/posts/me?isPublished=true
// GET /api/posts/me?limit=10&skip=20
// GET /api/posts/me?sortBy=createdAt:desc
router.get("/api/posts/me", auth, async (req: Request, res: Response) => {
  try {
    const pagination: any = {};
    const match: any = {};
    const sort: any = {};

    if (req.query.page && req.query.pageSize) {
      const page = parseInt(req.query.page.toString());
      const pageSize = parseInt(req.query.pageSize.toString());

      if (page <= 0 || pageSize <= 0) {
        return res.status(400).send({ error: { message: "Page and page size values must be greater than 0!" } });
      }

      pagination.limit = pageSize;
      pagination.skip = pageSize * page - pageSize;
    }

    if (req.query.isPublished) {
      match.isPublished = req.query.isPublished === "true";
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.toString().split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    // const posts = await Post.find({owner: req.user._id});
    // or..
    await req.user.populate({
      path: "posts",
      match,
      options: {
        ...pagination,
        sort,
      },
    });

    return res.status(200).send({ posts: req.user.posts });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

///////////////////////////
///// READ POST BY ID /////
///////////////////////////
router.get("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    const post = await Post.findById(_id);

    if (!post) {
      return res.status(404).send();
    }

    await post.populate("owner", ["email", "-_id"]);
    console.log("TODO CLEANUP THIS");

    console.log(post.populated("owner"));

    return res.status(200).send({ post });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

///////////////////////////
///// EDIT POST BY ID /////
///////////////////////////
router.patch("/api/posts/:id", auth, async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    const { title, content, isPublished } = req.body;

    // Checking allowed updates
    const requestedUpdates = Object.keys(req.body);
    const allowedUpdates = ["title", "content", "isPublished"];
    const isValidUpdate = requestedUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(403).send({ error: { message: "Invalid update!" } });
    }

    // Checking for errors
    const validationErrors: ValidationErrors = {};

    if (title) {
      validationErrors.title = undefined; // TODO: validation
    }

    if (content) {
      validationErrors.content = undefined; // TODO: validation
    }

    if (isPublished) {
      validationErrors.isPublished = undefined; // TODO: validation
    }

    // Ending validation
    if (checkErrors(validationErrors)) {
      return res.status(400).send({ error: { message: "Bad request!", validationErrors } });
    }

    const post = await Post.findOne({ _id, owner: req.user._id });

    if (!post) {
      return res.status(404).send({ error: { message: "Post not found!" } });
    }

    //@ts-ignore
    requestedUpdates.forEach((update) => (post[update] = req.body[update]));

    await post.save();

    return res.status(200).send({ post });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

/////////////////////////////
///// DELETE POST BY ID /////
/////////////////////////////
router.delete("/api/posts/:id", auth, async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    const post = await Post.findOne({ _id, owner: req.user._id });

    if (!post) {
      return res.status(404).send({ error: { message: "Post not found!" } });
    }

    await Post.findByIdAndDelete(_id);

    return res.status(200).send({ post });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

export default router;
