import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-view-orders',
  templateUrl: './view-orders.component.html',
  styleUrls: ['./view-orders.component.scss']
})
export class ViewOrdersComponent implements OnInit {

  ordersData = Array();
  loading = false;

  constructor(private userService: UserServiceService) { }

  async getOrders()
  {
    this.loading = true;
     await this.userService.getOrders(formatDate(new Date(), 'yyyy/MM/dd', 'en')).then(data=>
      {
        this.ordersData = data;
      });
  }

  async ngOnInit(): Promise<void> {
    this.ordersData.length = 0;
     await this.getOrders();
     this.loading = false;
  }

}
