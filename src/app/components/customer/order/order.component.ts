import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  orderNumber:any = history.state.newOrderNumber;
  totalAmount:any = history.state.totalAmount;;

  constructor(private router: Router, private userService: UserServiceService
    , private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  goToMenu()
  {
    this.userService.clearMenu();
    this.router.navigate(['menu']);
  }

}
