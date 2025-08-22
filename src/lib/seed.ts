
// A script to seed the database with some initial data.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import { products } from './data';

// IMPORTANT: Replace with your service account credentials
const serviceAccount = {
  "type": "service_account",
  "project_id": "rock-sorter-458718-b7",
  "private_key_id": "3c56312638684c5f55db55044d72317e697839d1",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRQ8Ce9In1lHQO\nz28tPeo26oBv5w+OqUGADouox1ei3q34tmVi1ki407+InbDUcu1AC26f+hloCC5U\nQplzO0pn1hJz84d0l51RmT0F5Rsgxp/z3BqKwBqUTX6CdU8y5jv1uZlMI5gF6K+L\nA8H9EZZsWtcsxf2fyPC7eLGvv1J3FregjySXhn53RIRku6AbiNzrw5JahNrxb1g9\nVlV0TCxK9KqZbUICYEIbtetVRornroAywKRCU/eDBl7EU0sbj2LcQgWPXTXsdsmB\n7i8cAdChnNSGm5Y1YEIA2qiq0D0ysugYau8/1KyWgwKH/hkytBuhQo3F5MYQ9ixh\nBCZcjTX7AgMBAAECggEAXGuf1pQJmfxGhYP3hfOiTT6kGsfhhxAZbYT/CTuA6N2P\n2Bg2DsC0vWxHWv7J6goX3gEuiljaf6edTnlbbBjzc4iH/c3ANS4AvNkAqmnU4VTX\nr8u1rTHKi1TuWo+UutYUBSJDIe1WZsWtQagXNL1fwdsczRlkOf101FcpooTM1urV\nBU+vBuHeE0sF+TKF6vIcXA83R+92aZrKieC3R6gT5k+hM7RqvGJfkqAzR/gp8FDG\nLyLOOsW6LcGDjPVADqWHEtMrvnyrkGE2IBiIoi4nfMsFKNeWTMiErFyM1aN/w/nD\n+iP2H4d6408vjVVt9ZqffFg4mBdRvj3j78UwQZ3mAQKBgQDudnprI6RuTjtvbU2k\n1bdE+IZLFd39+vCtoQ5riczi8OtAECRLdIySmxy55N6pg7RMRbCI1dwSds5FpdVf\nSc2BJkt22euFrCPztfNStndEPQ0fQf5i0PdX3vdWnbwTWqsDmJu8kqG/4sd+IowW\nHPbW8or5sYAHuNsDuW7dFxPfcQKBgQDgp5AWOmuSTuGEcVcQYXwN2RkpoNwWVm5b\nCba1n4AIjWAZIsdZdzXKfMeOxDkFr09WUJwWojV7Bb9f49O0mByKvzZkqgxqpvNB\nVhwuYWCTFrTEhHdITDilK+y4fQOO9fKYVG+IHts8I0xnIi6NGwp9gn8SBmJkbuSo\nCdrpQ6aOKwKBgQCQH/eZba9iI9J0ZEG7UJg2DWdNVmgXq2Vv65nFkUHOIAJvc9Ib\n8NNNgIZ6LEQPfFSqjKxH58ndNwUwvywZLYgReM2/hbJ91i7ci6oG4dVv3t5heAeC\nPf5gk5g2N5uGrxQRVlk6Pf2Y9j3QlJzKeLMP8wPgKlHRWP62X4sMAXi3YQKBgQDQ\nYr3l0ITt7xuDVfrzp+mBkuqjUaI1WjD9Y1JGwM/rnvAQANG3rDuKOxqE1IEsQ8St\nBRL0b7x6BAfTs6ox75MyJFIZKB9iYsBrz6tOXmdNqRc+3r0ipAk7NTZcnyHI310L\nbe8S7cRg0UFSvUM/AmFFsOGb364vCSoysQmNrIH3hwKBgFE0TIk61yqjzjODr4HI\nc+uJVfN82+JcYKVksiITpWBfljVwY/+8emQwlMDZAH7c9HarpCLYt13OHEwkw7oc\nxhdT6vlh7wcVOAzC+HGk4LST03u+pi0pdHOXcyhRXGLZzC4q+ii56ruzYUsjXtiG\nUSLWPdd477offiCfErTcv6MA\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@rock-sorter-458718-b7.iam.gserviceaccount.com",
  "client_id": "101924991656422052363",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40rock-sorter-458718-b7.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function seedDatabase() {
  const productsCollection = db.collection('products');
  const categoriesCollection = db.collection('categories');
  const batch = db.batch();

  console.log('Seeding products...');
  const productsSnap = await productsCollection.limit(1).get();
  if (productsSnap.empty) {
    for (const product of products) {
        const { id, ...productData } = product;
        const docRef = productsCollection.doc(id);
        batch.set(docRef, productData);
    }
    console.log(`${products.length} products added to batch.`);
  } else {
    console.log('Products collection already contains data. Skipping seeding.');
  }
  

  console.log('Seeding categories...');
  const categoryNames = [...new Set(products.map(p => p.category))];
  const existingCategoriesSnap = await categoriesCollection.limit(1).get();
  
  if (existingCategoriesSnap.empty) {
      for (const name of categoryNames) {
        const docRef = categoriesCollection.doc();
        batch.set(docRef, { name });
      }
      console.log(`${categoryNames.length} categories added to batch.`);
  } else {
      console.log('Categories collection already contains data. Skipping seeding.');
  }

  await batch.commit();
  console.log('Seeding complete!');
}

seedDatabase().catch(console.error);
