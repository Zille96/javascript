var fs = require("fs");
var mainFile = "FoodFacts.csv";
var countryArr = ["France","United Kingdom","Spain","Germany","United States","Australia","South Africa","Netherlands"];
var NorthE = ["Denmark","United Kingdom","Sweden ","Norway"];
var CentralE = ["France","Belgium","Germany","Switzerland","Netherlands"];
var   SouthE = ["Portugal","Greece","Italy","Spain","Croatia","Albania"];
var result = [];
var result2 = [];
var count =1;
var count2 = 1;
var fatcount = [0,0,0];
var proteincount = [0,0,0];
var carbocount = [0,0,0];
var d;
var File1 = "inFileAadding.json";
var res = [];
var movesecfun = 0;
var obj1={};
var temp ={};
var Nobj={};
var Sobj = {};
var Cobj = {};
var susa = [];
var sss = {};
var objsu  = {};
var objsa = {};
//var countryArr = ["United Kingdom","France","Germany","United States","Australia","Spain","Netherlands","South Africa"];
var mean = [1,1,1,1,1,1,1,1];

function convertFromcsvToJson(file){
  var rs=fs.createReadStream(file);
  var lineRead=require("readline").createInterface({
    input:rs
  });

  lineRead.on("line", function (line) {
    var d = line.toString();
    if(count==1)
    {
      var head = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      for (var i = 0; i < head.length; i++) {
        if (head[i] === "countries_en") country = i;
        else if (head[i] === "sugars_100g") sugar = i;
        else if (head[i] === "salt_100g") salt = i;
        else if (head[i] === "fat_100g") {fat = i;}
        else if (head[i] === "proteins_100g"){ protein = i;}
        else if (head[i] === "carbohydrates_100g") {carbo = i;}
      }
      count=0;
    }
    else{
      var arry = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      //------------sugar and salt filtering--------------
      if ((countryArr.indexOf(arry[country]) > -1) && arry[salt] !== "" && arry[sugar] !== "") {
        var obj = {};
        obj['country'] = arry[country];
        obj['salt'] = arry[salt];
        obj['sugar']=arry[sugar];
        result.push(obj);

      }
      // fat, protein,carbo calculation for geographical regions-------------------
      if((arry[fat]!="")&&(arry[protein]!=="")&&(arry[carbo]!=="")){
        if ((NorthE.indexOf(arry[country]) >-1)) {

          fatcount[0] = fatcount[0]+parseFloat(arry[fat]);
          carbocount[0] = carbocount[0]+parseFloat(arry[carbo]);
          proteincount[0] = proteincount[0]+parseFloat(arry[protein]);
          //  console.log("------protein-----"+proteincount[0]);
        }

        if ((SouthE.indexOf(arry[country]) > -1)) {
          fatcount[1] = fatcount[1]+parseFloat(arry[fat]);
          carbocount[1] = carbocount[1]+parseFloat(arry[carbo]);
          proteincount[1] = proteincount[1]+parseFloat(arry[protein]);
        }

        if ((CentralE.indexOf(arry[country]) > -1)) {
          fatcount[2] = fatcount[2]+parseFloat(arry[fat]);
          carbocount[2] = carbocount[2]+parseFloat(arry[carbo]);
          proteincount[2] = proteincount[2]+parseFloat(arry[protein]);
        }
      }
    }

  });

  //----------------saving fat,carbo,pro values in array--------------------------
  rs.on('end',function(){
    Nobj['region'] = "NE";
    Nobj['fat'] = fatcount[0];
    Nobj['carbo'] = carbocount[0];
    Nobj['protein'] = proteincount[0];
    // console.log("----------protein of NE------------"+proteincount[0]);
    result2.push(Nobj);

    Sobj['region'] = "SE";
    Sobj['fat'] = fatcount[1];
    Sobj['carbo'] = carbocount[1];
    Sobj['protein'] = proteincount[1];

    result2.push(Sobj);

    Cobj['region'] = "CE";
    Cobj['fat'] = fatcount[2];
    Cobj['carbo'] = carbocount[2];
    Cobj['protein'] = proteincount[2];

    result2.push(Cobj);
//---------------------witing the values of  fat,carbo pro in file----------------------
    fs.writeFile('filterout2.json',JSON.stringify(result2),function(err){
      if(err)throw err;

      console.log("------------------2nd graph filter successfull------------------------------");
    });

    //--------------------writing values of sugar and salt for selected countries in file--------------------
    fs.writeFile('inFileAadding.json',JSON.stringify(result),function(err){
      if(err)throw err;
      //  console.log(result);
      console.log("--------------------1st graph filter successfull------------------------------");
      movesecfun = 1;
      if(movesecfun ==1){
        //-----------------------function for getting mean final value of sugar and salt-------------------------
        function JsonAafterAadding(inFile){

          fs.readFile(inFile, function (err, data) {
            if (err) throw err;
            data = data.toString();
            d = JSON.parse(data);
            // console.log(d[0]["Table Name"]);
            // var count = 1;

            for (var i = 0, len = d.length; i < len; i++) {
              var o = d[i]["country"];
              var sugar = parseInt(d[i]["sugar"]);
              var salt = parseInt(d[i]["salt"]);
              if (sss.hasOwnProperty(o)) {
                var m = countryArr.indexOf(o);
                mean[m] = mean[m]+1;
                sss[o] = parseInt(sss[o]) + sugar;
                objsa[o] = parseInt(objsa[o])+ salt;
              }
              else {
                sss[o] = sugar;
                objsa[o] = salt;
              }

            }

            for (var v in sss) {

              if (sss.hasOwnProperty(v)) {
                var temp ={};
                temp["cx"] = v;
                var index =countryArr.indexOf(v);
                temp["Sugar"] = sss[v]/mean[index];
                temp["Salt"] =5*(objsa[v]/mean[index]);
                console.log(temp);
                susa.push(temp);
              }

            }

            //-------------writing mean values of sugar and salt in file-----------------
            fs.writeFile("graph1output.json", JSON.stringify(susa), function (err) {
              if (err) throw err;
              // console.log(res);
            })
          });
        };
        //-----------------------------------function call of sugar and salt final value----------------
        JsonAafterAadding(File1);
      }
    });

  });
};

//------------------------------function call for filtering all the data-----------------------------
convertFromcsvToJson(mainFile);
