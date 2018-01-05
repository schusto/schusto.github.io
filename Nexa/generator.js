
var HIGH_BIT = "240d";
var LOW_BIT  = "0d24";
var BITS_ARRAY = [HIGH_BIT, LOW_BIT];
var RF433 = "b2";
var RF315 = "d7";
var FOOTER = "0c00016f00000000";
var REPEATS = "0c";
var LONG_REPEAT = "5c";
var BYTES = 24;
var DATA_LENGTH = "3400";

function convertNumber(n, fromBase, toBase) {
  if (fromBase === void 0) {
    fromBase = 10;
  }
  if (toBase === void 0) {
    toBase = 10;
  }
  return parseInt(n.toString(), fromBase).toString(toBase);
}

function hex2Bin(hex) {
  return(convertNumber(hex, 16, 2));
}

function bin2Hex(bin) {
  return(convertNumber(bin, 2, 16));
}

function typePrefixOf(type){
  if(type === "RF433"){
    return RF433;
  }else if(type === "RF315"){
    return RF315;
  }else{
    throw new Error("Unsupported transmission type.");
  }
}


function randomPulse(){
  return BITS_ARRAY[Math.floor(Math.random() * 2)];
}


function generate(type){
  var code = "";
  for (i = 0; i < BYTES; i++) {
    var rand = randomPulse();
    code = code + rand;
  }

  var typePrefix = typePrefixOf(type);

  var res           = typePrefix + REPEATS      + DATA_LENGTH + code + FOOTER;
  var resWithRepeat = typePrefix + LONG_REPEAT  + DATA_LENGTH + code + FOOTER;

  return {
          regular: hexToBase64(res),
          long:    hexToBase64(resWithRepeat)
  }
}

function getRepeats(b64){
  var hex = base64ToHex(b64).replace(/ /g,'');
  var repeats = hex.substr(2, 2);
  var decimal = parseInt(repeats, 16);
  return decimal;
}

function getNewCode(b64, repeats){
  var hex = base64ToHex(b64).replace(/ /g,'');
  var start = hex.substr(0, 2);
  var end = hex.substr(4);

  var hexrepeats = parseInt(repeats).toString(16);

  if(hexrepeats.length == 1){
    hexrepeats = "0" + hexrepeats;
  }

  var res = (start + hexrepeats + end);
  return hexToBase64(res);

}

function startAnalyzeNexa(){
  var code = $("#usercode").val();
  var hex = base64ToHex(code).replace(/ /g,'');
  var message = hex.substr(4,2);
  var bin = hexToBin(message);
  var id =  bin.substr(0,26);
  var groupflag = bin.substr(26,1);
  var onoff = bin.substr(27,1);
  var device = bin.substr(28,4);
  var dim = bin.substr(32,4)
  $("#id").val(id);
}
/* NEXA:
 * The actual message is 32 bits of data:
 * bits 0-25: the group code - a 26bit number assigned to controllers.
 * bit 26: group flag
 * bit 27: on/off/dim flag
 * bits 28-31: the device code - 4bit number.
 * bits 32-35: the dim level - 4bit number.
 */

/*
PROTOCOL:

b2 RF

0c repeats

34 00   52 bytes follow (big endian)  24 pairs + 4 for the footer

## ##       24 0d for a 1, 0d 24 for a 0

0c 00 01 6f   (Footer)


 */
