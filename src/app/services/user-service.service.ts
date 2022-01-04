import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app"
import { getFirestore, query, where, getDocs, getDoc, collection, addDoc, Firestore, DocumentData, FieldValue, serverTimestamp, orderBy, limit } from "firebase/firestore"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Router } from '@angular/router';
import { OrderModel } from '../model/OrderModel';

const firebaseApp = initializeApp({
  apiKey: "AIzaSyB3EE-fMVGHKpXDC4rs3-jUf1Z7KHEbGYs",
  authDomain: "dosapointfirebase.firebaseapp.com",
  projectId: "dosapointfirebase",
});


const auth = getAuth();
const db = getFirestore();

@Injectable({
  providedIn: 'root'
})

export class UserServiceService {

  constructor(private router: Router) { }

  readData:any;
  newOrderId:any;
  menuFromDb : DocumentData[] = [];
  userInfo:any;

  async writeToUsersCollection(formdata:any)
  {
    const docRef = await addDoc(collection(db, "users"), formdata);
    
    //return docRef;
  }

  
  async writeToOrdersCollection(orderData:OrderModel)
  {
        const orderConverter = 
        {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          mobile: orderData.mobile,
          orderItems: orderData.orderedItems,
          totalAmount : orderData.totalAmount,
          orderDate: orderData.orderDate,
          orderStatus : orderData.orderStatus,
        };

    const docRef = await addDoc(collection(db, "orders"), orderConverter);
  }


  async verifyCredentials(loginFormData:any)
  { 
    const checkAccountQuery = query(collection(db, "users"), where("email", "==", loginFormData["email"]), where("activated", "==", true));
    const querySnapshotforAccount = await getDocs(checkAccountQuery);
    
    if(querySnapshotforAccount.size>0)
    {
      return 1;
    }
     return 0;  
  }

  async verifyAdminCredentials(loginFormData:any)
  { 
    const checkCredentialsQuery = query(collection(db, "users"), where("email", "==", loginFormData["email"]),
    where("activated", "==", true), where("role", 'in', ["admin", "developer"]));
    const querySnapshotForCredentials = await getDocs(checkCredentialsQuery);

    if(querySnapshotForCredentials.size>0)
    {
      return 1;
    } 
    return 0;
  }

  async checkAlreadyRegisteredMobile(loginFormData:any)
  { 
    
    const checkAccountQuery = query(collection(db, "users"), where("mobile", "==", loginFormData["mobile"]));
    const querySnapshotforAccount = await getDocs(checkAccountQuery);
    
    if(querySnapshotforAccount.size>0)
    {
      return 1;
    }
     return 0;  
  } 

  async getUserByEmail(email:string)
  { 
    const checkAccountQuery = query(collection(db, "users"), where("email", "==", email));
    const querySnapshotforAccount = await getDocs(checkAccountQuery);
    querySnapshotforAccount.forEach((doc) => {
      this.userInfo = doc.data();
     });
     return this.userInfo;
  } 


   async getMenu()
  { 
    if(this.menuFromDb.length <= 0 )
    {
    const getMenuQuery = query(collection(db, "menu"));
    const querySnapshotforMenu =  await getDocs(getMenuQuery);
    querySnapshotforMenu.forEach((doc) => {
     this.menuFromDb.push(doc.data());  
    });
  }
    return this.menuFromDb;  
  }

  async getNewOrderId()
  {
    const checkAccountQuery = query(collection(db, "orders"), orderBy("orderDate", "desc"), limit(1));
    const querySnapshotforAccount = await getDocs(checkAccountQuery);
    querySnapshotforAccount.forEach((doc) => {
      this.newOrderId = doc.data()["orderNumber"];
     });
    return this.newOrderId;
  }

  get isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    return (user === null) ? true : false;
  }

  
  SignOut() {
    auth.signOut().then(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('userInfo');
      this.menuFromDb.length = 0;  
      this.router.navigate(['customer-login']);
    })
  }

}
