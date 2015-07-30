var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var com;



process.on('uncaughtException',function(err){
	throw new Error(err);
});

process.stdout.write('\033c');

var display = [];
var buffer = [];
function write(str){
	buffer.push(str+'  ');
}

function max(a,b){
	if(a>b) return a;
	else return b;
}

function reflect(){
	process.stdout.write('\033[0;0H');
	for(key in buffer){
		process.stdout.write(buffer[key] + '\033[E\033[0K');
	}
	display = buffer;
	buffer = [];
}

serialport.list(function(err,port){
	for(key in port){
		if(port[key].manufacturer == 'TOCOS'){
			com = port[key].comName;
			break;
		}
	}
	var sp = new SerialPort(com,{
		baudrate: 115200,
		parser: serialport.parsers.readline("\n")
	},false);

	var di = [null,null,null,null];

	sp.open(function(){
		console.log('open');
		sp.on('data',function(data){
			var d = [
				data.substr(1,2),
				data.substr(3,2),
				data.substr(5,2),
				data.substr(7,2),
				data.substr(9,2),
				data.substr(11,8),
				data.substr(19,2),
				data.substr(21,4),
				data.substr(25,2),
				data.substr(27,4),
				data.substr(31,2),
				data.substr(33,2),
				data.substr(35,2),
				data.substr(37,10),
				data.substr(47,2)
			];
			var dbm = (parseInt(d[4],16)*7-1970)/20;
			var vol = parseInt(d[9],16);
			var dc = parseInt(d[12],16).toString(2);
			var dit = parseInt(d[11],16).toString(2);
			for(var i=1;i<=dit.length;i++){
				if(dc.substr(dc.length - i,1) == "1"){
					di[i - 1] = parseInt(dit.substr(dit.length - i,1),10);
				}
			}

			write("COM Name:\t" + com);
			write("Decibel:\t" + dbm + "dBm");
			write("Input Voltage:\t" + vol + "mV");
			write("Relay Flag:\t" + d[8]);
			for(var i=0;i<=3;i++){
				write("Digital " + (i+1) + ":\t" + di[i])
			}
			for(var i=0;i<=3;i++){
				write("Analog " + (i+1) + ":\t" + parseInt(d[13].substr(i*2,2),16));
			}
			reflect();
		});
		/*sp.write('ls\n',function(err,results){
			console.log('err ' + err);
			console.log('result ' + results);
		});*/
	});
})