import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app"
import { getFirestore, query, where, getDocs, getDoc, collection, addDoc, Firestore, DocumentData, FieldValue, serverTimestamp, orderBy, limit, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Router } from '@angular/router';
import { OrderModel } from '../model/OrderModel';
import { formatDate } from '@angular/common';

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
  oldMenuForUpdation : DocumentData[] = [];
  userInfo:any;
  allUsers: DocumentData[] = [];
  newUsers: DocumentData[] = [];
  ordersData: DocumentData[] = [];
  myOrdersData: DocumentData[] = [];
  totalSale = 0;

  async writeToUsersCollection(formdata:any)
  {
    const docRef = await addDoc(collection(db, "users"), formdata);
  }

  
  async writeToOrdersCollection(orderData:OrderModel)
  {
        const orderConverter = 
        {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          mobile: orderData.mobile,
          email: orderData.email,
          orderItems: orderData.orderedItems,
          totalAmount : orderData.totalAmount,
          orderDate: orderData.orderDate,
          orderStatus : orderData.orderStatus,
          exactDateAndTimeOfOrder: serverTimestamp()
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

  
  async clearMenuBeforeUpdation()
  { 
    const getMenuQuery = query(collection(db, "menu"));
    const querySnapshotforMenu =  await getDocs(getMenuQuery);
    querySnapshotforMenu.forEach(async (docItem) => {
     await deleteDoc(doc(db, "menu", docItem.id));
    });
  }

  async getAllUsers()
  { 
    this.allUsers.length = 0;
    const getUsersQuery = query(collection(db, "users"), where("activated", "==", true),
    orderBy("timeStamp", "desc"));
    const querySnapshotforMenu =  await getDocs(getUsersQuery);
    querySnapshotforMenu.forEach((doc) => {
    this.allUsers.push(doc.data());  
    });
    return this.allUsers;  
  }

  async getNewUsers()
  { 
    this.newUsers.length = 0;
    const getUsersQuery = query(collection(db, "users"), where("activated", "==", false),
    orderBy("timeStamp", "desc"));
    const querySnapshotforMenu =  await getDocs(getUsersQuery);
    querySnapshotforMenu.forEach((doc) => {
    this.newUsers.push(doc.data());  
    });
    return this.newUsers;  
  }

  async verifyUser(mobile:number)
  { 
    const getUsersQuery = query(collection(db, "users"), where("mobile", "==", mobile));
    const querySnapshotforMenu =  await getDocs(getUsersQuery);
    querySnapshotforMenu.forEach(async (user) => {
      const docRef = doc(db, 'users', user.id);
      await updateDoc(docRef, {
        activated: true
      });
    });
    return true;  
  }

  
  async deactivateUser(mobile:number)
  { 
    const getUsersQuery = query(collection(db, "users"), where("mobile", "==", mobile));
    const querySnapshotforMenu =  await getDocs(getUsersQuery);
    querySnapshotforMenu.forEach(async (user) => {
      const docRef = doc(db, 'users', user.id);
      await updateDoc(docRef, {
        activated: false
      });
    });
    return true;  
  }


  async getOrders()
  { 
    try
    {
    const getOrdersQuery = query(collection(db, "orders"), where("orderDate", "==", this.getOrderDateForPageRefresh()),
    orderBy("exactDateAndTimeOfOrder", "desc"));
    const querySnapshotforOrders =  await getDocs(getOrdersQuery);
    querySnapshotforOrders.forEach((doc) => {
     this.ordersData.push(doc.data());  
    }); 
  }
  catch(error)
  {
    console.error(error);
  }
  return this.ordersData; 
  }


  async getTodaysOrders()
  { 
    try
    {
    const getOrdersQuery = query(collection(db, "orders"), where("orderDate", "==", formatDate(new Date(), 'yyyy/MM/dd', 'en')),
    orderBy("exactDateAndTimeOfOrder", "desc"));
    const querySnapshotforOrders =  await getDocs(getOrdersQuery);
    querySnapshotforOrders.forEach((doc) => {
     this.ordersData.push(doc.data());  
    }); 
  }
  catch(error)
  {
    console.error(error);
  }
  return this.ordersData; 
  }


  async getMyOrders(email: string)
  { 
    try
    {
    const getOrdersQuery = query(collection(db, "orders"), where("email", "==", email),
    where("orderStatus", "==", "Done"), orderBy("exactDateAndTimeOfOrder", "desc"));
    const querySnapshotforOrders =  await getDocs(getOrdersQuery);
    querySnapshotforOrders.forEach((doc) => {
     this.myOrdersData.push(doc.data());  
    }); 
  }
  catch(error)
  {
    console.error(error);
  }
  return this.myOrdersData; 
  }

  async getTotalSale()
  { 
    try
    {
    this.totalSale = 0;
    const getOrdersQuery = query(collection(db, "orders"), where("orderStatus", "==", "Done"));
    const querySnapshotforOrders =  await getDocs(getOrdersQuery);
    querySnapshotforOrders.forEach((doc) => {
     this.totalSale = this.totalSale + doc.data()['totalAmount'];  
    }); 
  }
  catch(error)
  {
    console.error(error);
  }
  return this.totalSale; 
  }

  async cancelOrder(email: string, orderNumber: number)
  { 
    const getUsersQuery = query(collection(db, "orders"), where("email", "==", email),
    where("orderNumber", "==", orderNumber));
    const querySnapshotforMenu =  await getDocs(getUsersQuery);
    querySnapshotforMenu.forEach(async (user) => {
      const docRef = doc(db, 'orders', user.id);
      await updateDoc(docRef, {
        orderStatus: "Cancelled"
      });
    });
    return true;  
  }


  async getNewOrderId()
  {
    const checkAccountQuery = query(collection(db, "orders"), orderBy("exactDateAndTimeOfOrder", "desc"), limit(1));
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

  get getLoggedInUser(): any {
    const user = localStorage.getItem('user');
    return user;
  }
  
  
  SignOut() {
    auth.signOut().then(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('orderDate');
      this.menuFromDb.length = 0;  
      this.router.navigate(['customer-login']);
    })
  }

  async updateMenuCollection(newMenuData:any)
  {
    await this.clearMenuBeforeUpdation();
    
    newMenuData.forEach(async (value: any) => {
      const docRef = await addDoc(collection(db, "menu"), value);
    }); 
  }

  saveOrderDateForPageRefresh(value: string)
  {
    localStorage.setItem('orderDate', value);
  }

  getOrderDateForPageRefresh()
  {
    return localStorage.getItem('orderDate') as string;
  }

  clearMenu()
  {
    this.menuFromDb.length = 0;
  }

}
