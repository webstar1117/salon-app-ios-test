import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, NavParams, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarMode, Step } from 'ionic2-calendar/calendar';
import { ApplePay } from '@ionic-native/apple-pay/ngx'
import { Stripe } from '@awesome-cordova-plugins/stripe/ngx';
import { PaymentmodalPage } from '../paymentmodal/paymentmodal.page';

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
    private applePay: ApplePay,
    private stripe: Stripe,
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

  completeApplePay(resp) {
    const _this = this;

    return new Promise((resolution, rejection) => {
      $.post({
        url: 'https://api.stripe.com/v1/tokens',
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer pk_test_51JwyVGEDfScRvyn3VD4lrKiNBkdBVvFZjV1XKQeKcBWBUr6Yp9kAIf3dsqWmeXLLkCeufUJmTuVGFlY95Kirakv300Czfe5zDT")
        },
        data: {
          pk_token: atob(resp.paymentData),
          pk_token_payment_network: resp.paymentMethodNetwork,
          pk_token_instrument_name: resp.paymentMethodDisplayName,
          pk_token_transaction_id: resp.transactionIdentifier
        },
        success: function (data) {
          resolution({
            token: data.id
          });
        }
      });
    });
  }

  async applePayment() {
    try {
      const message = await this.applePay.canMakePayments();
      this.toastMessage(message);
      let order: any = {
        items: [
          { label: 'Service', amount: this.orginal_price },
          { label: 'Tip', amount: this.tip_price },
          { label: 'Beauty Salon', amount: this.total_price }
        ],
        shippingMethods: [],
        merchantIdentifier: 'merchant.hairday.hairday', /* The merchant ID registered in Apple developer account */
        currencyCode: 'USD',
        countryCode: 'US',
        billingAddressRequirement: ['name', 'email', 'phone'],
        shippingAddressRequirement: 'none',
        shippingType: 'none',
        merchantCapabilities: ['3ds', 'debit', 'credit'], /* The payment capabilities supported by the merchant. */
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        /* The list of payment networks supported by the merchant. */
        total: { label: 'HAIR DAY, INC.', amount: this.total_price, type: "final" }
      }

      await this.applePay.makePaymentRequest(order).then(resp => {
        this.completeApplePay(resp).then((stripeToken: any) => {
          // code goes here to store order in database etc
          this.stripe.setPublishableKey('pk_test_51JwyVGEDfScRvyn3VD4lrKiNBkdBVvFZjV1XKQeKcBWBUr6Yp9kAIf3dsqWmeXLLkCeufUJmTuVGFlY95Kirakv300Czfe5zDT');

          var params = {
            stripeToken,
            amount: this.total_price
          };

          this.http.post(this.apiUrl + "stripe-payment-test", JSON.stringify(params), this.httpOptions)
            .subscribe(res => {
              if (res["status"] == 200) {
                if (res["data"][0].status == "succeeded") {
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
                        if (res["status"] == 200) {
                          this.paymentSuccess();
                          this.modalCtrl.dismiss();
                        } else {
                          for (let key in res["message"]) {
                            this.toastMessage(res["message"][key]);
                          }
                        }
                      }, (err) => {
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
                        if (res["status"] == 200) {
                          this.paymentSuccess();
                          this.modalCtrl.dismiss();
                        } else {
                          for (let key in res["message"]) {
                            this.toastMessage(res["message"][key]);
                          }
                        }
                      }, (err) => {
                        console.log(err);
                      });
                  }
                }
              } else {
                this.toastMessage(res["message"]);
              }
            }, (err) => {
              console.log(err);
            });
        })
      });

      await this.applePay.completeLastTransaction('success');

    } catch (error) {
      this.toastMessage(error);
    }

  }



  async visaPay() {
    this.stripe.setPublishableKey('pk_test_51JwyVGEDfScRvyn3VD4lrKiNBkdBVvFZjV1XKQeKcBWBUr6Yp9kAIf3dsqWmeXLLkCeufUJmTuVGFlY95Kirakv300Czfe5zDT');
    // this.stripe.setPublishableKey('pk_live_51JwyVGEDfScRvyn3j8YQM4l9uTTKZlz0TLWacwe9eXH7mc5KDBlVSk99nuoL8BhQDb7N0dtNpGRy0ayilZ7p2v3R00ODJoMc4F');
    var token = localStorage.getItem('token');
    let card;

    const loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      cssClass: 'loading',
      message: 'Checking...',
    });
    loading.present();

    this.http.get(this.apiUrl + "card/get-default?api_token=" + token)
      .subscribe(res => {
        if (res["status"] == 200) {
          if (res["data"] != null) {
            var expire = res["data"].expired_at;
            expire = expire.split("/");
            card = {
              number: res["data"].number,
              expMonth: expire[0],
              expYear: "20" + expire[1],
              cvc: res["data"].last_digit
            }
            this.stripe.createCardToken(card)
              .then((token) => {
                var params = {
                  stripeToken: token.id,
                  amount: this.total_price
                };
                this.http.post(this.apiUrl + "stripe-payment-test", JSON.stringify(params), this.httpOptions)
                  .subscribe(res => {
                    if (res["status"] == 200) {
                      if (res["data"][0].status == "succeeded") {
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
                              console.log(err);
                            });
                        }
                      }
                    } else {
                      this.toastMessage(res["message"]);
                      loading.dismiss();
                    }
                  }, (err) => {
                    console.log(err);
                    loading.dismiss();
                  });
              }).catch(error => console.log(error));
          } else {
            this.toastMessage('You set no card as a default.');
            loading.dismiss();
          }
        } else {
          this.toastMessage('You set no card as a default.')
          loading.dismiss();
        }
      }, (err) => {
        console.log(err);
        loading.dismiss();
      });
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
