# Development

## Prerequisites
See [PREREQUISITES.md](PREREQUISITES.md) to get your local development environment set up.

## How the site is built
The site is built with [Astro](https://astro.build/) and TypeScript. Astro pre-renders every page to static HTML at
build time (no JavaScript needed to see the content), and only the interactive bits (the meetings filter and the
tables that read from Google Sheets) load a small amount of React in the browser.

```
src/
  pages/            one .astro file per page; the file name is the URL (cpc.astro -> /cpc)
  layouts/          BaseLayout.astro: <head>, navbar, footer shared by every page
  components/       static building blocks (Card, ResLink, Navbar, Footer, ...)
  components/islands/  interactive React components (meetings filter, Google Sheet tables)
  data.ts           service positions, workshops, meetings list, Google Sheet URLs
  utils/            CSV + date helpers
  styles/global.css site-wide styles
```

Most routine updates (service positions, workshops, the meetings list) are edits to `src/data.ts`.
Upcoming leads/events come from the published Google Sheets listed in `src/data.ts` and update without a rebuild.

To add a page: create `src/pages/<name>.astro` using `BaseLayout` (copy an existing page), give it a `title` and
`description`, and add it to `NAV_PAGES` or `NAV_GROUPS` in `src/data.ts`.

## Run it locally
Install the dependencies (once, and again whenever `package.json` changes):
```bash
npm install
```

Start the dev server, which reloads as you edit:
```bash
npm run dev
```
Then open http://localhost:4321/

Build the production site into `dist/` (also type-checks the project; the build fails on type errors):
```bash
npm run build
```

Serve the built `dist/` folder to double-check it:
```bash
npm run preview
```

## Deploys (Netlify)
The site is hosted on [Netlify](https://www.netlify.com/), configured by `netlify.toml`:

- **Production**: every merge/push to `main` builds and deploys automatically.
- **Deploy Previews**: every pull request gets its own preview URL, posted as a comment/check on the PR. Use it to
  review changes before merging.
- **Branch deploys**: other pushed branches get a URL like `https://<branch>--<site>.netlify.app`.

There is nothing to run by hand: push a branch, open a PR, and check the preview.

## Testing with nginx or Docker
`build.sh` still supports Mike's local nginx and Docker workflows. It runs `npm run build` and serves the
static output in `dist/`.

### NGINX

To build and deploy to nginx running locally, you'll first want to do _one_ of the following.

**Method 1**
- (recommended) Set the environment variable to the correct location for your html files
- Open a Terminal in WebStorm. If this isn't an Ubuntu (WSL) Terminal stop! Google how to set up WebStorm so that it integrates with WSL.
- Type in these commands:

```bash
pwd
cd
echo "export NGINX_HTML=/var/www/html" >> .bashrc
source .bashrc
```
Now you want to switch back to the directory that was printed out after you typed in 'pwd'. To do so, type in cd {directory name}

**Method 2**
You will make a small change to the build script.
Edit `build.sh` (using WebStorm) and change the path specified after NGINX_HTML from `"/usr/local/nginx/html"` to `"/var/www/html"`

After setting the env variable or changing the build script you will want to do this:

```bash
./build.sh local
```
Use your browser to view the site locally:

http://localhost/

Pages are generated as folders (`dist/cpc/index.html`), so nginx's default config serves `/cpc` without changes.

### RANCHER or DOCKER
First open Rancher Desktop or Docker Desktop, whichever you installed.
Now, to build and deploy to Rancher or Docker, run this:
```bash
./build.sh docker
```

Use your browser to view the site locally:

http://localhost/

The Docker image builds the site with Node 22 and serves `dist/` with nginx (see `Dockerfile` and `nginx.conf`).

## build.sh targets

```
./build.sh build    # builds the site into dist/, then stops
./build.sh local    # build + deploy to local nginx (either /usr/local/nginx/html or /var/www/html)
./build.sh docker   # build Docker image + run at http://localhost
./build.sh aws      # build + deploy to AWS Amplify (legacy; Netlify replaces this)
```

AWS deploy requires `aws login --profile district24` first.
