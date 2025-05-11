# SubnettingApp

## 1. Az alkalmazásról

A _SubnettingApp_ egy IPv4-hálózatok felbontására és tervezésére szolgáló program, amelynek célja, hogy megkönnyítse és felgyorsítsa az ilyen jellegű IP‑számítási feladatok elvégzését. Természetesen kiválóan alkalmas oktatási célokra is: a diákok önellenőrzésre használhatják.

**Fő funkciók**

- **Hálózati adatok megjelenítése**:
  Gyors áttekintés egy adott hálózat kezdő- és végállomás-címéről, broadcast-címéről, maximális host-számáról stb.

- **Hálózat felbontása eltérő host-igényekhez**:
  Egy címtartomány szétosztása olyan alhálózatokra, amelyek kielégítik az egyedi helyigényeket.

- **Hálózat azonos méretű alhálózatokra történő felbontása**:
  Egy hálózat szabályos, egyenletes felosztása azonos méretű alhálózatokra.

## Forráskód

Egyaránt a frontend, egyaránt a backend ebben az egy repository-ban van tárolva, két alkönyvtárban

- [subnettingapp-backend](/subnettingapp-backend/)
- [subnettingapp-frontend](/subnettingapp-frontend/)

## Főbb technológiák

**Backend:** Node.JS + TypeScript + Express + MongoDB  
**Frontend:** Angular

## Üzembe helyezés

### Backend

**Előfeltétel**: [Node.JS telepítése](https://nodejs.org/en/download)

#### Fontos környezeti változók

- `PORT`: az a portszám, amin a webszervert futtatni akarjuk, ha ez nincs megadva, akkor alapértelmezésben az alkalmazás az `5000`-es TCP portot fogja használni
- `SUBNETTINGAPP_MONGO_URI`: MongoDB connection-string
- `SUBNETTINGAPP_JWT_KEY`: a [JWT](https://jwt.io/) tokenek digitális aláírásához (signature) használt titkos-kulcs
- `SUBNETTINGAPP_FRONTEND_HOST`: a backend-nek szüksége van a frontend-szerver URL-jére (email-ek tartalmában)
- `SUBNETTINGAPP_SMTP_HOST`: a használni kívánt SMTP szerver címe
- `SUBNETTINGAPP_SMTP_PORT`: a használni kívánt SMTP szerver portjának száma
- A használni kívánt SMTP szerver hitelesítő adataihoz:
  - `SUBNETTINGAPP_SMTP_USER`
  - `SUBNETTINGAPP_SMTP_PASS`

> Ezeket az értékeket egy lokális `.env` fájlban is rögzíthetjük, mert onnan is be tudja olvasni az alkalmazás.

#### Előkészítés és futtatás

```bash
cd subnettingapp-backend
```

**Függőségek telepítése:**

```bash
npm install
```

**Development szerver inditása:**

```
npm run dev
```

> A development szerver a kód módosításakor automatikusan újraindul.

**"Hagyományos" futtatás**:

Typescript kód fordítása:

```
npm run build
```

Lefordított kód futtatása:

```
npm run start
```

### Frontend

**Előfeltételek**:

1. [Node.JS telepítése](https://nodejs.org/en/download)
2. [Angular CLI telepítése](https://nodejs.org/en/download) (`npm install -g @angular/cli`)

#### Futtatás

```bash
cd subnettingapp-frontend

```

Függőségek telepítése:

```bash
npm install
```

Frontend szerver indítása:

```
ng serve
```

## Automatizált tesztek

A backend-en az API végpontokra automatizált tesztek vannak írva. Ezeket az `npm run test` paranccsal lehet lefuttatni.

```bash
cd subnettingapp-backend
npm run test
```

> A tesztelés a [Jest](https://jestjs.io/) keretrendszer segítségével történik.

## Email küldések kipróbálása (MailTrap)

Az alkalmazás rendelkezik jelszó-helyreállítási funkcióval. Ebben a folyamatban kulcsfontosságú szereppel bír az email-ek küldése.

Értelemszerűen, ha ezt ki akarjuk próbálni _development_ környezetben, nem szeretnénk azt, hogy az email-ek tényleg kézbesítésre kerüljenek.
Erre nyújt tökéletes megoldást a [MailTrap](https://mailtrap.io/), ami lehetővé teszi, hogy az alkalmazás egy _fake/dummy_ SMTP szerverre küldje az üzeneteket, ami "elkapja" őket, annélkül hogy kézbesítené. A fejlesztők pedig meg tudják tekinteni ezeket a leveleket egy felhasználóbarát környezetben.

A megfelelő [környezeti változók](#fontos-környezeti-változók) beállításával a webszerver SMTP üzeneteit egyszerűem a MailTrap email-testing platformjára küldhetjük.

