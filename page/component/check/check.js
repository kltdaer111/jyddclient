const moment = require('moment');

Page({
    data: {
        arr: [],
        sysW: null,
        lastDayOfMonth: '',
        firstDayInWeek: '',
        weekArr: ['日', '一', '二', '三', '四', '五', '六'],
        current_yearmonth : '',
        current_day : '',
        current_choose : '',
        year: '',
        month: '',
        booklist: [],
        booklist_len: '',
        workers: [],
        chosen_worker: ''
    },
    onLoad(){
      let self = this;
      dd.getStorage({
        key: 'myinfo',
        success: function(res){
          let myinfo = res.data;
          dd.httpRequest({
            headers: {
              "Content-Type": "application/json"
            },
            url: 'http://139.196.211.108:3000/ddclient',
            method: 'POST',
            // 需要手动调用JSON.stringify将数据进行序列化
            data: JSON.stringify({
              code: 5,
              data: {
                myinfo: myinfo,
              }
            }),
            dataType: 'json',
            success: function(res) {
              console.log(res);
              let data = res.data.res;
              let workers = {};
              for(let i = 0; i < data.length; i++){
                workers[data[i]['工号']] = {
                  name : data[i]['姓名'],
                }
              }
              self.setData({
                workers : workers,
                chosen_worker : data[0]['工号']
              });
              self.dataTime();
              self.refreshBooklist();
              self.showDays();
            },
            fail: function(res) {
              console.log(res);
              switch(res.status){
                case(452):{
                  dd.alert({content: res.data.res});
                }
                break;
                default:{
                  dd.alert({content: '提交失败,请检查网络'});
                }
              }
            },
          });
        },
        fail: (res)=>{
          console.log(res);
          dd.alert({content: res.errorMessage});
        }
    });
    },
    //获取日历相关参数
    dataTime: function () {
        this.setData({
          year : moment().format('YYYY'),
          month : moment().format('MM'),
          current_day : moment().format('D'),
          firstDayInWeek : moment().startOf('month').format('d'),
          lastDayOfMonth : moment().endOf('month').format('D')
        });
    },
    refreshBooklist(){
      let self = this;
      dd.httpRequest({
        headers: {
          "Content-Type": "application/json"
        },
        url: 'http://139.196.211.108:3000/ddclient',
        method: 'POST',
        // 需要手动调用JSON.stringify将数据进行序列化
        data: JSON.stringify({
          code: 6,
          data: {
            jobnumber: self.data.chosen_worker,
            year: self.data.year,
            month: self.data.month
          }
        }),
        dataType: 'json',
        success: function(res) {
          console.log(res);

        },
        fail: function(res) {
          console.log(res);
          switch(res.status){
            case(452):{
              dd.alert({content: res.data.res});
            }
            break;
            default:{
              dd.alert({content: '提交失败,请检查网络'});
            }
          }
        },
      });
    },

    showDays(){
      //先清空数组，根据得到今月的最后一天日期遍历 得到所有日期
      if (this.data.arr) {
          this.data.arr = [];
      }
      for (var i = 0; i < this.data.lastDayOfMonth; i++) {
          var obj = {};
          obj.day = i + 1;
          this.data.arr.push(obj);
          for (var j = 0; j < this.data.booklist.length; j++) {
              if (this.data.arr[i].day == this.data.booklist[j]) {
                  this.data.arr[i].isbook = 1
              }
          }
      }
      var res = dd.getSystemInfoSync();
      this.setData({
          sysW: res.windowHeight / 6.5,
          marLet: this.data.firstDayInWeek,
          booklist_len: this.data.booklist.length
      });
    },
    onTapDate(e){
      console.log(e);
      let self = this;
      dd.datePicker({
        format: 'yyyy-MM',
        currentDate: self.data.current_choose,
        success: (res) => {
          console.log(res);
          console.log(moment(res.date).format('YYYY'));
          self.setData({
            year : moment(res.date).format('YYYY'),
            month : moment(res.date).format('MM'),
            current_choose  : res.date,
            firstDayInWeek : moment(res.date).startOf('month').format('d'),
            lastDayOfMonth : moment(res.date).endOf('month').format('D')
          });
          self.refreshBooklist();
          self.showDays();
        },
      });
    },
    onChange(e){
      console.log(e);
    }
    //TODO 从onshow调走之后无法正常显示,在调试器中任意更改data数据恢复正常.看看和onshow有什么关系
});