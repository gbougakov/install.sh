# `install.sh`
The universal install script
![](https://imgs.xkcd.com/comics/universal_install_script.png)

This comic by XKCD is fun, but the pictured script has some flaws.
1. It can create a mess with multiple package version
2. It can install different packages (try searching `wget` on NPM)
3. It will take a lot of time to run it

Introducing the new `install.sh` which doesn't have any of those flaws.

## System requirements
macOS/Linux, `brew` and `pip`.

## Install
You don't even need to install it, just run
```sh
npx install.sh <package name>
```

If you still want to install it, run
```sh
npm i -g install.sh
```

## Let's install something!
```
install.sh wget
```

```
install.sh apple-jwt
```

by [George Bougakov](https://bygeorgenet.me)