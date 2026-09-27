// backend/seed/seed.js
//
// Seeds MongoDB (users, repos, commits, issues) and MinIO (committed files).
//
//   node seed/seed.js                   seed (removes the previous seed first)
//   node seed/seed.js --as=you@mail.com give the "you" repos to your real account
//   node seed/seed.js --reset           only remove seeded data
//
// Only things this script created are removed: it records their ids in
// seed/.seeded.json and fake users all use @seed.gitverse.dev emails.
//
// ASSUMPTIONS (check against your code, each one is a one-line change):
//  1. ES modules ("type": "module") and these model paths/default exports.
//  2. Users live in a "users" collection with username, email, password,
//     repositories, followedUsers, starRepos (you use the raw driver for users).
//     If userControllers.js calls client.db("someName"), set USERS_DB_NAME=someName.
//  3. Repository: name, description, content (String), visibility (Boolean), owner, issues.
//     Issue: title, description, status ("open"/"closed"), repository.
//     Commit: author, message, repository, files, createdAt (from your notes).
//  4. Commit.author holds the user's _id. If you store the username instead, edit authorField().

import "dotenv/config";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Repository from "../models/repoModel.js";
import Issue from "../models/issueModel.js";
import Commit from "../models/commitModel.js";

const { ObjectId } = mongoose.Types;
const MANIFEST = fileURLToPath(new URL("./.seeded.json", import.meta.url));
const PASSWORD = "Password123!";
const authorField = (user) => user._id;

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed with NODE_ENV=production");
  process.exit(1);
}

/* ------------------------------ seed content ------------------------------ */

const md = (title, desc, feats = [], extra = "") =>
  `# ${title}\n\n${desc}\n\n## Features\n${feats.map((f, i) => `- [${i < 2 ? "x" : " "}] ${f}`).join("\n")}\n\n` +
  `| Command | What it does |\n|---------|--------------|\n| \`npm install\` | Installs dependencies |\n| \`npm run dev\` | Starts the dev server |\n\n` +
  `\`\`\`js\nconsole.log("${title} is running");\n\`\`\`\n${extra}`;
const js = (n) =>
  `import express from "express";\n\nconst app = express();\napp.get("/", (req, res) => res.send("${n}"));\napp.listen(3000);\n`;
const java = (c) =>
  `public class ${c} {\n  public static void main(String[] args) {\n    System.out.println("${c}");\n  }\n}\n`;
const py = (n) =>
  `def main():\n    print("${n}")\n\n\nif __name__ == "__main__":\n    main()\n`;
const ignore = "node_modules\n.env\n.DS_Store\n";

const USERS = {
  you: { username: "demo", email: "demo@seed.gitverse.dev" },
  arjun: { username: "arjun_dev", email: "arjun@seed.gitverse.dev" },
  maya: { username: "maya.codes", email: "maya@seed.gitverse.dev" },
  kabir: { username: "kabir_k", email: "kabir@seed.gitverse.dev" },
};

// steps: [daysAgo, commit message, files added or updated]. Keep daysAgo descending.
const REPOS = [
  {
    name: "sojourn",
    owner: "you",
    desc: "Airbnb-style listings platform",
    steps: [
      [
        92,
        "Initial commit",
        {
          "README.md": md("Sojourn", "Airbnb-style listings platform", [
            "Listings",
            "Search",
            "Bookings",
          ]),
          ".gitignore": ignore,
        },
      ],
      [80, "Add express server", { "server.js": js("Sojourn") }],
      [
        61,
        "Add listings routes",
        { "listings.js": "export const listings = [];\n" },
      ],
      [
        33,
        "Add review model",
        { "review.js": "export const review = { rating: 5 };\n" },
      ],
      [
        9,
        "Update README with setup steps",
        {
          "README.md": md(
            "Sojourn",
            "Airbnb-style listings platform",
            ["Listings", "Search", "Bookings", "Reviews"],
            "\nRun `npm run dev` to start.\n",
          ),
        },
      ],
    ],
  },
  {
    name: "notemind",
    owner: "you",
    desc: "Notes app with a second brain",
    steps: [
      [
        70,
        "Initial commit",
        {
          "README.md": md("NoteMind", "Notes and second-brain app", [
            "Notes",
            "Tags",
            "Search",
          ]),
        },
      ],
      [
        44,
        "Add note editor",
        {
          "editor.jsx":
            "export default function Editor() {\n  return <textarea />;\n}\n",
        },
      ],
      [
        18,
        "Add tag filtering",
        { "tags.js": 'export const tags = ["idea", "todo"];\n' },
      ],
    ],
  },
  {
    name: "meridian",
    owner: "you",
    desc: "Video conferencing with WebRTC",
    steps: [
      [
        55,
        "Initial commit",
        {
          "README.md": md("Meridian", "WebRTC video conferencing", [
            "Rooms",
            "Screen share",
            "Chat",
          ]),
        },
      ],
      [38, "Add signalling server", { "server.js": js("Meridian") }],
      [
        21,
        "Add peer connection helper",
        { "peer.js": "export const peer = new RTCPeerConnection();\n" },
      ],
      [
        6,
        "Fix mute button state",
        {
          "peer.js":
            "export const peer = new RTCPeerConnection();\nexport const mute = () => {};\n",
        },
      ],
    ],
  },
  {
    name: "proconnect",
    owner: "you",
    desc: "LinkedIn-style networking app",
    steps: [
      [
        48,
        "Initial commit",
        {
          "README.md": md("ProConnect", "LinkedIn-style networking app", [
            "Profiles",
            "Connections",
            "Feed",
          ]),
        },
      ],
      [27, "Add feed API", { "feed.js": js("ProConnect") }],
      [
        3,
        "Add connection requests",
        { "connections.js": "export const requests = [];\n" },
      ],
    ],
  },
  {
    name: "dsa-java",
    owner: "you",
    desc: "Data structures and algorithms in Java",
    steps: [
      [
        40,
        "Add binary search",
        {
          "README.md": md("DSA in Java", "Practice problems and solutions", [
            "Arrays",
            "Trees",
            "Graphs",
          ]),
          "BinarySearch.java": java("BinarySearch"),
        },
      ],
      [25, "Add linked list", { "LinkedList.java": java("LinkedList") }],
      [12, "Add BFS and DFS", { "Graph.java": java("Graph") }],
      [1, "Add Dijkstra", { "Dijkstra.java": java("Dijkstra") }],
    ],
  },
  {
    name: "gitverse-cli",
    owner: "you",
    desc: "The .gitV command line tool",
    steps: [
      [
        30,
        "Initial commit",
        {
          "README.md": md("gitV CLI", "Command line client for GitVerse", [
            "init",
            "login",
            "push",
            "pull",
          ]),
        },
      ],
      [
        14,
        "Add login command",
        { "login.js": "export const login = () => {};\n" },
      ],
      [
        2,
        "Add push and pull",
        {
          "push.js": "export const push = () => {};\n",
          "pull.js": "export const pull = () => {};\n",
        },
      ],
    ],
  },
  {
    name: "campus-connect",
    owner: "arjun",
    desc: "Event and club discovery for campuses",
    steps: [
      [
        85,
        "Initial commit",
        {
          "README.md": md("Campus Connect", "Find clubs and events on campus", [
            "Events",
            "Clubs",
            "RSVP",
          ]),
        },
      ],
      [50, "Add events API", { "server.js": js("Campus Connect") }],
      [15, "Add RSVP flow", { "rsvp.js": "export const rsvp = () => {};\n" }],
    ],
  },
  {
    name: "weather-cli",
    owner: "arjun",
    desc: "Weather in your terminal",
    steps: [
      [
        60,
        "Initial commit",
        {
          "README.md": md(
            "Weather CLI",
            "Check the weather from the terminal",
            ["Current", "Forecast"],
          ),
          "weather.py": py("weather"),
        },
      ],
      [28, "Add 5 day forecast", { "forecast.py": py("forecast") }],
    ],
  },
  {
    name: "ml-notebooks",
    owner: "arjun",
    desc: "Machine learning experiments",
    steps: [
      [
        75,
        "Initial commit",
        {
          "README.md": md("ML Notebooks", "Experiments and notes", [
            "Regression",
            "Classification",
            "CNNs",
          ]),
        },
      ],
      [35, "Add linear regression", { "regression.py": py("regression") }],
      [10, "Add MNIST classifier", { "mnist.py": py("mnist") }],
    ],
  },
  {
    name: "quantum-sandbox",
    owner: "maya",
    desc: "Playing with qubits and circuits",
    steps: [
      [
        66,
        "Initial commit",
        {
          "README.md": md(
            "Quantum Sandbox",
            "Small quantum circuit experiments",
            ["Bell state", "Grover", "QFT"],
          ),
        },
      ],
      [41, "Add Bell state circuit", { "bell.py": py("bell") }],
      [8, "Add Grover search", { "grover.py": py("grover") }],
    ],
  },
  {
    name: "portfolio-site",
    owner: "maya",
    desc: "Personal portfolio",
    steps: [
      [
        50,
        "Initial commit",
        {
          "README.md": md("Portfolio", "My personal site", [
            "About",
            "Projects",
            "Contact",
          ]),
          "index.html":
            "<!doctype html>\n<title>Maya</title>\n<h1>Hi, I'm Maya</h1>\n",
        },
      ],
      [16, "Add projects section", { "projects.html": "<h2>Projects</h2>\n" }],
    ],
  },
  {
    name: "tcet-acm-sigai-site",
    owner: "kabir",
    desc: "Website for the ACM SIGAI chapter",
    steps: [
      [
        45,
        "Initial commit",
        {
          "README.md": md("ACM SIGAI TCET", "Chapter website", [
            "Events",
            "Team",
            "Blog",
          ]),
        },
      ],
      [20, "Add events page", { "events.js": js("events") }],
      [4, "Add team page", { "team.js": js("team") }],
    ],
  },
  {
    name: "leetcode-solutions",
    owner: "kabir",
    desc: "Daily problem solutions",
    steps: [
      [
        100,
        "Initial commit",
        {
          "README.md": md("LeetCode", "Solutions and notes", [
            "Easy",
            "Medium",
            "Hard",
          ]),
        },
      ],
      [52, "Add two sum", { "TwoSum.java": java("TwoSum") }],
      [
        19,
        "Add valid parentheses",
        { "Parentheses.java": java("Parentheses") },
      ],
    ],
  },
];

// [repo, title, status, daysAgo]
const ISSUES = [
  ["sojourn", "Add pagination to the listings page", "open", 20],
  ["sojourn", "Search ignores case", "closed", 45],
  ["notemind", "Tags should be editable", "open", 12],
  ["meridian", "Echo when two people share audio", "open", 9],
  ["meridian", "Room link should copy to clipboard", "closed", 30],
  ["proconnect", "Connection request badge never clears", "open", 5],
  ["dsa-java", "Add complexity notes to each solution", "open", 15],
  ["gitverse-cli", "push re-uploads unchanged commits", "open", 3],
  ["campus-connect", "RSVP count is off by one", "closed", 22],
  ["quantum-sandbox", "Document how to run on a simulator", "open", 7],
  ["tcet-acm-sigai-site", "Events page is not mobile friendly", "open", 6],
];

/* ------------------------------- helpers --------------------------------- */

const prng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = prng(42);
const daysAgo = (d) =>
  new Date(Date.now() - d * 864e5 - Math.floor(rand() * 20 * 36e5));

async function bcryptHash(pw) {
  try {
    const m = await import("bcryptjs");
    return (m.default || m).hash(pw, 10);
  } catch {
    const m = await import("bcrypt");
    return (m.default || m).hash(pw, 10);
  }
}

// Works with @aws-sdk/client-s3 (v3) or aws-sdk (v2)
async function makeS3() {
  const {
    S3_ENDPOINT: endpoint,
    S3_ACCESS_KEY: accessKeyId,
    S3_SECRET_KEY: secretAccessKey,
    S3_BUCKET: Bucket,
  } = process.env;
  const region = process.env.S3_REGION || "us-east-1";
  try {
    const {
      S3Client,
      PutObjectCommand,
      ListObjectsV2Command,
      DeleteObjectsCommand,
    } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });
    return {
      put: (Key, Body) => s3.send(new PutObjectCommand({ Bucket, Key, Body })),
      async purge(Prefix) {
        let ContinuationToken;
        do {
          const r = await s3.send(
            new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken }),
          );
          if (r.Contents?.length)
            await s3.send(
              new DeleteObjectsCommand({
                Bucket,
                Delete: { Objects: r.Contents.map((o) => ({ Key: o.Key })) },
              }),
            );
          ContinuationToken = r.NextContinuationToken;
        } while (ContinuationToken);
      },
    };
  } catch {
    const AWS = (await import("aws-sdk")).default;
    const s3 = new AWS.S3({
      endpoint,
      region,
      accessKeyId,
      secretAccessKey,
      s3ForcePathStyle: true,
      signatureVersion: "v4",
    });
    return {
      put: (Key, Body) => s3.putObject({ Bucket, Key, Body }).promise(),
      async purge(Prefix) {
        let ContinuationToken;
        do {
          const r = await s3
            .listObjectsV2({ Bucket, Prefix, ContinuationToken })
            .promise();
          if (r.Contents.length)
            await s3
              .deleteObjects({
                Bucket,
                Delete: { Objects: r.Contents.map((o) => ({ Key: o.Key })) },
              })
              .promise();
          ContinuationToken = r.NextContinuationToken;
        } while (ContinuationToken);
      },
    };
  }
}

/* --------------------------------- main ---------------------------------- */

const args = process.argv.slice(2);
const asEmail = args.find((a) => a.startsWith("--as="))?.split("=")[1];
const onlyReset = args.includes("--reset");

await mongoose.connect(process.env.MONGODB_URI);
const usersDb = process.env.USERS_DB_NAME
  ? mongoose.connection.useDb(process.env.USERS_DB_NAME).db
  : mongoose.connection.db;
const usersCol = usersDb.collection("users");
const s3 = await makeS3();

async function reset() {
  const seedUsers = await usersCol
    .find({ email: /@seed\.gitverse\.dev$/ })
    .toArray();
  const seedUserIds = seedUsers.map((u) => u._id);
  let repoIds = [];
  if (fs.existsSync(MANIFEST))
    repoIds = JSON.parse(fs.readFileSync(MANIFEST, "utf8")).repos.map(
      (id) => new ObjectId(id),
    );
  const owned = await Repository.find({ owner: { $in: seedUserIds } }).select(
    "_id",
  );
  repoIds.push(...owned.map((r) => r._id));

  for (const id of repoIds) await s3.purge(`${id}/`);
  await Commit.deleteMany({ repository: { $in: repoIds } });
  await Issue.deleteMany({ repository: { $in: repoIds } });
  await Repository.deleteMany({ _id: { $in: repoIds } });
  await usersCol.updateMany(
    {},
    {
      $pull: {
        repositories: { $in: repoIds },
        starRepos: { $in: repoIds },
        followedUsers: { $in: seedUserIds },
      },
    },
  );
  await usersCol.deleteMany({ _id: { $in: seedUserIds } });
  if (fs.existsSync(MANIFEST)) fs.unlinkSync(MANIFEST);
  console.log(
    `Removed ${repoIds.length} seeded repos and ${seedUserIds.length} seeded users`,
  );
}

async function seed() {
  let realUser = null;
  if (asEmail) {
    realUser = await usersCol.findOne({ email: asEmail });
    if (!realUser) {
      console.error(`No user with email ${asEmail}`);
      process.exit(1);
    }
  }

  const passwordHash = await bcryptHash(PASSWORD);
  const users = {};
  for (const [key, u] of Object.entries(USERS)) {
    if (key === "you" && realUser) {
      users.you = realUser;
      continue;
    }
    const doc = {
      ...u,
      password: passwordHash,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };
    const { insertedId } = await usersCol.insertOne(doc);
    users[key] = { ...doc, _id: insertedId };
  }

  const repoIds = {};
  let commitCount = 0,
    fileCount = 0;
  for (const r of REPOS) {
    const owner = users[r.owner];
    const repoId = new ObjectId();
    repoIds[r.name] = repoId;
    const createdAt = daysAgo(r.steps[0][0]);

    const issues = ISSUES.filter((i) => i[0] === r.name).map(
      ([, title, status, d]) => {
        const at = daysAgo(d);
        return {
          _id: new ObjectId(),
          title,
          description: `Steps to reproduce and expected behaviour for: ${title}.`,
          status,
          repository: repoId,
          createdAt: at,
          updatedAt: at,
        };
      },
    );
    await Repository.create(
      [
        {
          _id: repoId,
          name: r.name,
          description: r.desc,
          content: "",
          visibility: true,
          owner: owner._id,
          issues: issues.map((i) => i._id),
          createdAt,
          updatedAt: createdAt,
        },
      ],
      { timestamps: false },
    );
    if (issues.length) await Issue.create(issues, { timestamps: false });

    // Each commit is a snapshot, the same shape `gitv push` produces
    const state = {};
    const commits = [];
    for (const [d, message, files] of r.steps) {
      Object.assign(state, files);
      const _id = new ObjectId();
      const at = daysAgo(d);
      const keys = [];
      for (const [name, body] of Object.entries(state)) {
        const key = `${repoId}/${_id}/${name}`;
        await s3.put(key, body);
        keys.push(key);
        fileCount++;
      }
      commits.push({
        _id,
        author: authorField(owner),
        message,
        repository: repoId,
        files: keys,
        createdAt: at,
        updatedAt: at,
      });
    }
    await Commit.create(commits, { timestamps: false });
    commitCount += commits.length;
    await usersCol.updateOne(
      { _id: owner._id },
      { $addToSet: { repositories: repoId } },
    );
  }

  // Follows and stars so the Starred page and suggestions have something to show
  await usersCol.updateOne(
    { _id: users.you._id },
    {
      $addToSet: {
        followedUsers: { $each: [users.arjun._id, users.maya._id] },
        starRepos: {
          $each: [
            repoIds["campus-connect"],
            repoIds["quantum-sandbox"],
            repoIds["tcet-acm-sigai-site"],
          ],
        },
      },
    },
  );
  await usersCol.updateOne(
    { _id: users.arjun._id },
    {
      $addToSet: {
        followedUsers: users.you._id,
        starRepos: repoIds["sojourn"],
      },
    },
  );
  await usersCol.updateOne(
    { _id: users.maya._id },
    {
      $addToSet: {
        starRepos: { $each: [repoIds["meridian"], repoIds["dsa-java"]] },
      },
    },
  );

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify({ repos: Object.values(repoIds).map(String) }, null, 2),
  );

  console.log(
    `Seeded ${REPOS.length} repos, ${commitCount} commits, ${ISSUES.length} issues, ${fileCount} files`,
  );
  console.log(`Logins (password ${PASSWORD}):`);
  Object.values(USERS).forEach((u) => console.log(`  ${u.email}`));
  if (realUser) console.log(`"you" repos belong to ${asEmail}`);
}

try {
  await reset();
  if (!onlyReset) await seed();
} finally {
  await mongoose.disconnect();
}
