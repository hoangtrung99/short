import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  res
    .status(301)
    .redirect(
      "https://expo.dev/accounts/solashi/projects/neknote-dev/builds/bf9f62cc-e4f7-4938-ad62-ac55e77ce51f"
    );
}
