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
        detail: {},
        workers: [],
        chosen_worker: 0
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
              let workers = [];
              for(let i = 0; i < data.length; i++){
                workers.push({
                  name : data[i]['姓名'],
                  jobnumber : data[i]['工号']
                });
              }
              self.setData({
                workers : workers,
                chosen_worker : 0
              });
              self.nowDate();
              self.refreshShow();
              
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
    refreshShow(){
      //1 刷新时间参数
      this.setData({
        firstDayInWeek : moment(this.data.current_choose).startOf('month').format('d'),
        lastDayOfMonth : moment(this.data.current_choose).endOf('month').format('D')
      });
      //2 刷新booklist
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
            jobnumber: self.data.workers[self.data.chosen_worker].jobnumber,
            year: self.data.year,
            month: self.data.month
          }
        }),
        dataType: 'json',
        success: function(res) {
          console.log(res);
          let data = res.data.res;
          let booklist = [];
          let detail = {};
          for(let i = 0; i < data.length; i++){
            let dayinmonth = moment(data[i]['日期']).format('D');
            booklist.push(dayinmonth);
            if(detail[dayinmonth] == undefined){
              detail[dayinmonth] = [];
            }
            detail[dayinmonth].push(data[i]);
          }
          self.setData({
            detail : detail,
            booklist : booklist
          });
          //3 刷新界面
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
    //获取日历相关参数
    nowDate() {
      let year = moment().format('YYYY');
      let month = moment().format('MM');
      this.setData({
        year : year,
        month : month,
        current_day : moment().format('D'),
        current_choose : year + '-' + month,
        current_yearmonth : year + '-' + month
      });
    },
 
    showDays(){
      //根据得到今月的最后一天日期遍历 得到所有日期
      let arr = [];
      for (var i = 0; i < this.data.lastDayOfMonth; i++) {
          var obj = {};
          obj.day = i + 1;
          arr.push(obj);
          for (var j = 0; j < this.data.booklist.length; j++) {
              if (arr[i].day == this.data.booklist[j]) {
                  arr[i].isbook = 1
              }
          }
      }
      var res = dd.getSystemInfoSync();
      this.setData({
          sysW: res.windowHeight / 6.5,
          marLet: this.data.firstDayInWeek,
          arr : arr
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
          });
          self.refreshShow();
        },
      });
    },
    onChange(e){
      console.log(e);
      this.setData({
        chosen_worker : e.detail.value[0]
      })
      this.refreshShow();
    },
    onTapDay(e){
      console.log(e);
      let self = this;
      if(e.target.dataset.id in this.data.detail){
        console.log(this.data.detail[e.target.dataset.id]);
        let res = this.formatLog(this.data.detail[e.target.dataset.id]);
        dd.alert({
          content : self.formatOut(res)
        });
      }
    },
    formatLog(dailylog){
      let res = {};
      for(let i = 0; i < dailylog.length; i++){
        //合并同项目施工
        if(dailylog[i].工作内容 ==  '项目施工'){
          let title = dailylog[i].项目号 + '号项目施工';
          if(res[title] == undefined){
            res[title] = {};
          }
          res[title]['项目名称'] = dailylog[i].订单内容;
          res[title]['客户'] = dailylog[i].客户名称;
          if(dailylog[i].工作人员工号 == dailylog[i].汇报人工号){
            res[title]['负责人'] = dailylog[i].汇报人姓名;
            if(res[title]['工作时间'] == undefined){
              res[title]['工作时间'] = [];
            }
            res[title]['工作时间'].push(dailylog[i].开始时间 + '至' + dailylog[i].结束时间);
          }
          else{
            if(res[title]['施工人员'] == undefined){
              res[title]['施工人员'] = [];
            }
            res[title]['施工人员'].push(dailylog[i].工作人员姓名);
          }
        }
        else{
          let title = dailylog[i].工作内容;
          if(res[title] == undefined){
            res[title] = {};
          }
          res[title]['负责人'] = dailylog[i].汇报人姓名;
          if(res[title]['工作时间'] == undefined){
            res[title]['工作时间'] = [];
          }
          res[title]['工作时间'].push(dailylog[i].开始时间 + '至' + dailylog[i].结束时间);
        }
      }
      return res;
      console.log(res);
    },
    formatOut(formatObjLog){
      let res = '';
      let i = 1;
      for(let title in formatObjLog){
        res += '工作内容' + i + '\n' + title + ':\n'
        for(let sub_title in formatObjLog[title]){
          res += sub_title + ':' + JSON.stringify(formatObjLog[title][sub_title]) + '\n';
        }
        i++;
        res += '\n';
      }
      return res;
    }
});