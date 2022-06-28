import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, NavParams, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarMode, Step } from 'ionic2-calendar/calendar';
import { PaymentmodalPage } from '../paymentmodal/paymentmodal.page';
declare var cordova;
@Component({
  selector: 'app-appointmentmodal',
  templateUrl: './appointmentmodal.page.html',
  styleUrls: ['./appointmentmodal.page.scss'],
})
export class AppointmentmodalPage implements OnInit {

  title: string = 'Appointment';
  multi: any;
  professional_id: any;
  service_id: any;
  salon_id: any;
  appointment_id: any;
  multidata: any;
  datas: any;
  date: any = new Date();
  time: any;
  time_done: any;
  tip: any = "none";
  isSetTime: boolean = false;
  payable: boolean = false;
  total_price: number = 0;
  orginal_price: number = 0;
  tip_price: number = 0;
  options1 = {
    initialSlide: 0,
    slidesPerView: 3.6,
  };
  calendar = {
    mode: 'month' as CalendarMode,
    step: 30 as Step,
    startingDayMonth: 1,
    dateFormatter: {
      formatMonthViewDayHeader: function (date: Date) {
        var week = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        return week[date.getDay()];
      }
    }
  };

  avatarUrl = 'https://hairday.app/assets/images/professional-avatars/';
  professionalUrl = 'https://hairday.app/assets/images/professionals/';
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.multi = this.navParams.get('multi');
    if (this.multi == false) {
      this.professional_id = this.navParams.get('professional_id');
      this.service_id = this.navParams.get('service_id');
      this.salon_id = this.navParams.get('salon_id');
      this.appointment_id = this.navParams.get('appointment_id');
      this.getOneData();
    } else {
      this.multidata = this.navParams.get('data');
      this.getMultiData();
    }
  }

  getOneData() {
    var params = {
      salon_id: this.salon_id,
      service_id: this.service_id,
      professional_id: this.professional_id,
      year: this.date.toLocaleDateString("en-US", { year: 'numeric' }),
      month: this.date.toLocaleDateString("en-US", { month: 'long' }),
      date: this.date.toLocaleDateString("en-US", { day: 'numeric' }),
      day: this.date.toLocaleDateString("en-US", { weekday: 'long' })
    }
    this.http.post(this.apiUrl + "appointment/book-one", JSON.stringify(params), this.httpOptions)
      .subscribe(res => {
        console.log(res);
        if (res["status"] == 200) {
          this.datas = [res["data"]];
          this.datas[0]["date"] = new Date();
          this.datas[0]["dateString"] = this.datas[0]["date"].toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'short' })
          this.datas[0]["viewTitle"] = "";
          this.datas[0]["time"] = "";
          this.datas[0]["time_done"] = "";
          this.datas[0]["editable"] = false;
          this.total_price = res["data"]["service"]["price"];
          this.orginal_price = this.total_price;
        }
      }, (err) => {
        console.log(err);
      });
  }

  getMultiData() {
    for (var x in this.multidata) {
      this.multidata[x].year = this.date.toLocaleDateString("en-US", { year: 'numeric' }),
        this.multidata[x].month = this.date.toLocaleDateString("en-US", { month: 'long' }),
        this.multidata[x].date = this.date.toLocaleDateString("en-US", { day: 'numeric' }),
        this.multidata[x].day = this.date.toLocaleDateString("en-US", { weekday: 'long' })
    }
    this.http.post(this.apiUrl + "appointment/book-multi", JSON.stringify({ data: this.multidata }), this.httpOptions)
      .subscribe(res => {
        console.log(res);
        if (res["status"] == 200) {
          this.datas = res["data"];
          for (var i in this.datas) {
            this.datas[i]["date"] = new Date();
            this.datas[i]["dateString"] = this.datas[i]["date"].toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'short' })
            this.datas[i]["viewTitle"] = "";
            this.datas[i]["time"] = "";
            this.datas[i]["time_done"] = "";
            this.datas[i]["editable"] = false;
            if (this.datas[i]["service"]["price"] != null) {
              this.total_price += Number(this.datas[i]["service"]["price"]);
            }
          }
          this.orginal_price = this.total_price;
        }
      }, (err) => {
        console.log(err);
      });
  }

  editDate(key) {
    this.datas[key].editable = true;
  }

  previous(key) {
    this.datas[key].date = new Date(this.datas[key].date.setMonth(this.datas[key].date.getMonth() - 1));
  }

  next(key) {
    this.datas[key].date = new Date(this.datas[key].date.setMonth(this.datas[key].date.getMonth() + 1));
  }

  onViewTitleChanged(title, key) {
    this.datas[key].viewTitle = title;
  }

  onCurrentDateChanged(ev: Date, key) {
    this.datas[key].date = ev;
    this.date = ev;
    this.datas[key].dateString = this.datas[key].date.toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'short' })
    var params = {
      professional_id: this.datas[key]["professional"]["id"],
      service_id: this.datas[key]["service"]["id"],
      salon_id: this.datas[key]["service"]["salon_id"],
      year: this.datas[key].date.toLocaleDateString("en-US", { year: 'numeric' }),
      month: this.datas[key].date.toLocaleDateString("en-US", { month: 'long' }),
      date: this.datas[key].date.toLocaleDateString("en-US", { day: 'numeric' }),
      day: this.datas[key].date.toLocaleDateString("en-US", { weekday: 'long' })
    }
    this.http.post(this.apiUrl + "appointment/time-list", JSON.stringify(params), this.httpOptions)
      .subscribe(res => {
        console.log(res);
        if (res["status"] == 200) {
          this.datas[key]['time_list'] = res["data"];
        }
      }, (err) => {
        console.log(err);
      });
  };

  setTime(time, key) {
    this.datas[key].time = time.start;
    this.datas[key].time_done = time.end;
  }

  setTip(tip) {
    this.tip = tip;
    if (tip == "none") {
      this.total_price = this.orginal_price;
      this.tip_price = 0;
    } else {
      this.tip_price = this.orginal_price * tip / 100;
      this.total_price = Number(this.orginal_price) + Number(this.tip_price);
    }
  }

  nextStep() {
    var time = true;
    var date = true;
    for (var key in this.datas) {
      if (this.datas[key].time == "") {
        time = false;
        break;
      } else {
        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth();
        var currentDate = new Date().getDate();
        var currentHour = new Date().getHours();
        var currentMin = new Date().getMinutes();
        var year = this.datas[key].date.getFullYear();
        var month = this.datas[key].date.getMonth();
        var day = this.datas[key].date.getDate();
        var hour = this.datas[key].time.split(":")[0];
        if (this.datas[key].time.indexOf("am") != -1) {
          hour = Number(hour);
        } else {
          hour = Number(hour) + Number(12);
        }
        var min = this.datas[key].time.split(":")[1].substr(0, 2);
        min = Number(min);
        if (new Date(year, month, day, hour, min) < new Date(currentYear, currentMonth, currentDate, currentHour, currentMin)) {
          date = false;
          break;
        }
      }
    }

    if (time && date) {
      for (var key in this.datas) {
        this.datas[key].editable = false;
      }
      if (!this.isSetTime) {
        this.isSetTime = true;
      } else {
        this.title = 'Payment Information';
        this.payable = true;
      }
    } else if (!date) {
      this.toastMessage("Please select available date and time. Cannot select past date and time.")
    } else {
      this.toastMessage("Please select time.")
    }
  }

  completeApplePay(resp) 
  {


  }

  async applePayment() {
    try 
    {
    let exititself=true;
    let totalpricestripe = this.total_price*100;
    let browser = cordova.InAppBrowser.open("https://hairday.app/apple-pay/payment.php?total="+totalpricestripe,"_blank","location=yes,zoom=no,hideurlbar=yes,toolbarcolor=#000000,hidenavigationbuttons=yes,closebuttoncolor=#ffffff,closebuttoncaption=Done");
    browser.addEventListener('loadstart',async event=>
      { 
        if (event.url.includes("success")) {
          exititself=false;  
          browser.close();   
         const loading = await this.loadingCtrl.create({
         spinner: 'bubbles',
          cssClass: 'loading',
         message: 'Checking...',
          });
          loading.present();
          if (this.multi == false) {
            var data = {
              api_token: localStorage.getItem('token'),
              professional_id: this.professional_id,
              service_id: this.service_id,
              salon_id: this.salon_id,
              year: this.date.toLocaleDateString("en-US", { year: 'numeric' }),
              month: this.date.toLocaleDateString("en-US", { month: 'long' }),
              date: this.date.toLocaleDateString("en-US", { day: 'numeric' }),
              day: this.date.toLocaleDateString("en-US", { weekday: 'long' }),
              time: this.datas[0].time,
              price: this.orginal_price,
              tip: this.tip_price,
              tax: 0
            }
            this.http.post(this.apiUrl + "appointment/add", JSON.stringify(data), this.httpOptions)
              .subscribe(res => {
                loading.dismiss();
                if (res["status"] == 200) {
                  this.paymentSuccess();
                  this.modalCtrl.dismiss();
                } else {
                  for (let key in res["message"]) {
                    this.toastMessage(res["message"][key]);
                  }
                }
              }, (err) => {
                loading.dismiss();
                console.log(err);
              });
          } else {
            let multidata = [];
            for (var i in this.datas) {
              let data = {
                professional_id: this.datas[i]["professional"]["id"],
                service_id: this.datas[i]["service"]["id"],
                salon_id: this.datas[i]["service"]["salon_id"],
                year: this.datas[i]["date"].toLocaleDateString("en-US", { year: 'numeric' }),
                month: this.datas[i]["date"].toLocaleDateString("en-US", { month: 'long' }),
                date: this.datas[i]["date"].toLocaleDateString("en-US", { day: 'numeric' }),
                day: this.datas[i]["date"].toLocaleDateString("en-US", { weekday: 'long' }),
                time: this.datas[i].time,
                price: this.datas[i]["service"]["price"],
                tip: this.tip_price,
                tax: 0
              }
              multidata.push(data);
            }
            let requestData = {
              api_token: localStorage.getItem('token'),
              data: multidata
            }
            this.http.post(this.apiUrl + "appointment/add-multi", JSON.stringify(requestData), this.httpOptions)
              .subscribe(res => {
                loading.dismiss();
                if (res["status"] == 200) {
                  this.paymentSuccess();
                  this.modalCtrl.dismiss();
                } else {
                  for (let key in res["message"]) {
                    this.toastMessage(res["message"][key]);
                  }
                }
              }, (err) => {
                loading.dismiss();
                console.log(err);
              });
          }
        }
        else if (event.url.includes("error")) 
        {
          exititself=false;
          browser.close();
          this.toastMessage("Failed To Charge Payment");
        }

      })
      browser.addEventListener('exit',() => {
        if(exititself)
        this.toastMessage("Failed To Charge Payment");
      }, err => {
        console.error(err);
      });     
    } catch (error) {
      this.toastMessage(error);
    }

  }



  async visaPay() {

  }

  async paymentSuccess() {
    const modal = await this.modalCtrl.create({
      component: PaymentmodalPage,
      componentProps: { datas: this.datas },
      cssClass: 'appointmodal',
      mode: 'ios',
      swipeToClose: true,
      presentingElement: await this.modalCtrl.getTop()
    });

    return await modal.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async toastMessage(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }
}
