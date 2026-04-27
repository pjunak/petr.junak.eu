# Static-site Dockerfile. Drop into the app repo as `Dockerfile`.
# Suitable for plain HTML/CSS/JS sites with no build step. For sites with a
# build step (Vite, Astro, etc.), replace with a multi-stage build.

FROM nginx:1.27-alpine

# Replace nginx's default site with the repo contents.
COPY . /usr/share/nginx/html

# Strip files that shouldn't be served. Pair with .dockerignore for belt-and-
# braces — this catches anything that slipped through.
RUN rm -rf \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.github \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/.dockerignore \
    /usr/share/nginx/html/README.md \
    2>/dev/null || true

EXPOSE 80
