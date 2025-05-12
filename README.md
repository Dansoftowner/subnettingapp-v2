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

> Az alkalmazásnak van egy régebbi "elődje" is, ez szintén elérhető egy [nyilvános repository-ban](https://github.com/Dansoftowner/SubnettingApp).

## Forráskód

A _backend_ és a _frontend_ alkalmazás is ebben az egy repository-ban van tárolva, két alkönyvtárban:

- [`subnettingapp-backend`](/subnettingapp-backend/)
- [`subnettingapp-frontend`](/subnettingapp-frontend/)

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

## Adattárolás

A `SubnettingApp`-nak szükége van felhasználói adatok tárolására, adatbázisra.
Az ilyen általános, egyszerű igényű projektek számára, mint amilyen ez is, a [MongoDB](https://www.mongodb.com/) egy tökéletes választás.

Előnyei közé tartozik az, hogy nagyon gördülékenyen és egyszerűen integrálható Node.js alkalmazásokkal. Ráadásul a [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) ingyenesen biztosít MongoDB adattárolást a felhőben, ami tesztelésre is kiválóan alkalmas, így lokálisan nem is van feltétlenül szükség letölteni.  
Ha mégis lokálisan akarunk MongoDB adatbázis-szervert futtatni, a *MongoDB Community Server*t [innen lehet letölteni](https://www.mongodb.com/try/download/community).

Az alkalmazásnak szüksége van a csatlakozási sztring-re (connection-string), amit a `SUBNETTINGAPP_MONGO_URI` környezeti változóval tudunk beállítani.

### Kollekciók

- `users`: felhasználók adataihoz
- `passwordtokens`: a jelszó-helyreállítási folyamatban használt *token*ek tárolásához
- `historyitems`: a felhasználó előzményeinek mentéséhez

### Biztonsági megfontolások

Alapvető fontosságú az, hogy a jelszavak, illetve egyéb érzékeny (_sensitive_) token-ek titkosítva legyenek eltárolva az adatbázisban.

Ezért mind a jelszavak, mind a *password token*ek a [Bcrypt](https://www.npmjs.com/package/bcrypt) titkosítási algoritmussal *hash*elésre kerülnek.

A _password tokenek_ pedig - amelyek az elfelejtett jelszavak helyreállítási folyamatban játszanak kulcsszerepet - egy [TTL index](https://www.mongodb.com/docs/manual/core/index-ttl/) segítségével 1 óra után automatikusan törlésre kerülnek a létrehozás után.

## Autentikáció és autorizáció

Felhasználók kezelése [JWT](https://jwt.io/) tokenekkel történik.  
A hitelesítést az `/api/auth` végpont végzi, ami sikeres művelet esetén egy `x-auth-token` nevű HTTP header-ben
adja vissza a JWT tokent, amit a frontend a `localStorage`-ban tárol el.

Az autorizáció is a védett végpontoknál a JWT token `x-auth-token` HTTP fejlécben történő küldésével történik.

## Többnyelvűség (I18N)

Az alkalmazás webes felülete _internacionalizálva_ van, a magyar nyelv mellett az angol nyelv is támogatott.
A fordításokat a `subnettingapp-frontend/assets/i18n` könyvtárban találhatjuk JSON formátumban.
Pl.: hu.json

```json
{
  ...
  "dashboard.new_calculation": "Új számolás",
  "dashboard.loading": "Betöltés...",
  "dashboard.no_title": "Nincs cím",
  "dashboard.delete_tooltip": "Bejegyzés törlése",
  "form.header": "Számolás"
  ...
}
```

Új nyelvek támogatása tehát nagyon egyszerűen implementálható egy új JSON fájl létrehozásával.

> Az i18n Angular-ban történő hatékony implementálásához az `ngx-translate` csomagot használja a program.
