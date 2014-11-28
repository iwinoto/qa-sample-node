
var health_examples = [
  'What is HIV?',
  'What are the benefits of taking aspirin daily?',
  'What can I do to get more calcium?',
  'What is hepatitis C?',
  'How do I quit smoking?',
  'Who is at risk for diabetes?',
  'What should I expect before heart surgery?',
  'What is my recovery outlook after heart surgery?',
  'I am at risk for high blood pressure?'
];

var travel_examples = [
                       'Where is the best place to stay in Singapore?',
                       'What is there to do in The Hague?',
                       'Where should I eat in KL?',
                       'Is is safe to travel to Kabul?',
                       'How do I get downtown from Gare du Nord?',
                       'What airport should I use to get to London?',
                       'Where is a ferry from England to Holland?',
                       'Am I at risk of Hepatitis A in the DRC?',
                       'Where is the best shopping in Milan?'
                     ];

function loadExample() {
  var service = (document.getElementById('healthService').checked ? 'health' : 'travel');
  if(service == 'health'){
    document.getElementById('questionText').value = health_examples[Math.floor(Math.random()*health_examples.length)];
  }else{
    document.getElementById('questionText').value = travel_examples[Math.floor(Math.random()*travel_examples.length)];
  }
  
}

//fill and submit the form with a random example
function showExample() {
  loadExample();
  document.getElementById('qaForm').submit();
}

document.onload=
  (document.getElementById('questionText').value == '')?
    loadExample() : '';