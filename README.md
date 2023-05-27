# Typer

It's just a fictional publishing(similar to Medium) app that implements a **micro-frontend architecture** by using [single-spa](https://single-spa.js.org/) and [importmap](https://github.com/WICG/import-maps) specifications


[Click here to see more pet projets](https://github.com/cicerohen/projets)

## Typer projects

### [typer-app-mfe](https://github.com/cicerohen/typer-app-mfe)
It's a monorepo project that contains the [microfrontends](https://single-spa.js.org/docs/module-types) used by Typer. Currently all micro-frontends are being implemented using React

### [typer-app-importmap-deployer](https://github.com/cicerohen/typer-app-importmap-deployer)
It's a small project that is responsible for updating the importmap-[stage].json with the URL to the latest version of a micro-frontend javascript bundle hosted in an S3 bucket
 
### [typer-app-server](https://github.com/cicerohen/typer-app-server)
It's the backend project used by Typer. It is being build using [NestJS](https://nestjs.com/) and [GraphQL](https://docs.nestjs.com/graphql/quick-start).



