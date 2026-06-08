import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: 'Hello! I am AI Bot from ZT Addiction 🤖\nHow can I help you?',
          sender: 'bot',
          timestamp: new Date()
        },
        {
          id: 2,
          text: 'مرحباً! أنا بوت ذكي من ZT Addiction 🤖\nكيف يمكنني مساعدتك؟',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }, 500);
  }, []);

  const quickReplies = {
    en: [
      { id: 'track', text: 'Track My Order' },
      { id: 'shipping', text: 'Shipping Info' },
      { id: 'payment', text: 'Payment Methods' },
      { id: 'more', text: 'More Questions' }
    ],
    ar: [
      { id: 'track', text: 'تتبع طلبي' },
      { id: 'shipping', text: 'معلومات الشحن' },
      { id: 'payment', text: 'طرق الدفع' },
      { id: 'more', text: 'المزيد من الأسئلة' }
    ]
  };

  const moreQuestions = {
    en: [
      { id: 'return', text: 'Return Policy' },
      { id: 'contact', text: 'Contact Us' },
      { id: 'hours', text: 'Working Hours' },
      { id: 'more2', text: 'Even More Questions' }
    ],
    ar: [
      { id: 'return', text: 'سياسة الإرجاع' },
      { id: 'contact', text: 'تواصل معنا' },
      { id: 'hours', text: 'ساعات العمل' },
      { id: 'more2', text: 'أسئلة إضافية' }
    ]
  };

  const evenMoreQuestions = {
    en: [
      { id: 'custom', text: 'Request Perfume Not on Site' },
      { id: 'authentic', text: 'Are Products Authentic?' },
      { id: 'gift', text: 'Gift Wrapping Available?' },
      { id: 'back', text: 'Back to Main Menu' }
    ],
    ar: [
      { id: 'custom', text: 'طلب عطر غير موجود بالموقع' },
      { id: 'authentic', text: 'هل المنتجات أصلية؟' },
      { id: 'gift', text: 'تغليف الهدايا متاح؟' },
      { id: 'back', text: 'العودة للقائمة الرئيسية' }
    ]
  };

  const responses = {
    en: {
      track: '📦 To track your order:\n\n1. Go to "Orders" tab below\n2. Find your order\n3. View real-time status\n\nNeed help? Contact us!',
      shipping: '🚚 Shipping Info:\n\n• Delivery: 2-3 business days\n• Cairo: Next day\n• Track anytime',
      payment: '💳 Payment Methods:\n\n• Cash on Delivery ✅\n• Visa/Mastercard\n• InstaPay\n• Mobile Wallets\n\nAll secure!',
      return: '↩️ Return Policy:\n\n• 7 days to return\n• Product unused\n• Original packaging\n• Full refund guaranteed\n\nEasy process!',
      contact: '📞 Contact Us:\n\n📱 +20 127 255 8833\n📧 abrahemelgazaly2@gmail.com\n💬 WhatsApp available\n\nWe reply fast!',
      hours: '🕐 Working Hours:\n\n🗓 Sun-Thu: 9 AM - 9 PM\n🗓 Fri-Sat: 10 AM - 10 PM\n\n📞 Customer service ready!',
      custom: '🎁 Custom Request:\n\nWe can get ANY perfume!\n✅ Best prices\n✅ Fast delivery\n✅ 100% original\n\n📱 WhatsApp us:\nwa.me/201272558833',
      authentic: '✅ 100% Authentic:\n\n• All products original\n• From authorized distributors\n• Quality guaranteed\n• Certificates available\n\nNo fakes, ever!',
      gift: '🎀 Gift Wrapping:\n\n✅ FREE premium wrapping\n✅ Greeting card included\n✅ Elegant packaging\n\nMention in order notes!'
    },
    ar: {
      track: '📦 لتتبع طلبك:\n\n1. اذهب لتبويب "طلباتي" بالأسفل\n2. ابحث عن طلبك\n3. شاهد الحالة\n\nتحتاج مساعدة؟ تواصل معنا!',
      shipping: '🚚 معلومات الشحن:\n\n• التوصيل: 2-3 أيام\n• القاهرة: اليوم التالي\n• تتبع في أي وقت',
      payment: '💳 طرق الدفع:\n\n• الدفع عند الاستلام ✅\n• فيزا/ماستركارد\n• إنستاباي\n• المحافظ الإلكترونية\n\nكلها آمنة!',
      return: '↩️ سياسة الإرجاع:\n\n• مدة: 7 أيام\n• منتج غير مستخدم\n• العبوة الأصلية\n• استرداد كامل مضمون\n\nعملية سهلة!',
      contact: '📞 تواصل معنا:\n\n📱 +20 127 255 8833\n📧 abrahemelgazaly2@gmail.com\n💬 واتساب متاح\n\nنرد بسرعة!',
      hours: '🕐 ساعات العمل:\n\n🗓 الأحد-الخميس: 9ص - 9م\n🗓 الجمعة-السبت: 10ص - 10م\n\n📞 خدمة العملاء جاهزة!',
      custom: '🎁 طلب خاص:\n\nنقدر نوفر أي عطر!\n✅ أفضل الأسعار\n✅ توصيل سريع\n✅ أصلي 100%\n\n📱 واتساب:\nwa.me/201272558833',
      authentic: '✅ أصلية 100%:\n\n• جميع المنتجات أصلية\n• من موزعين معتمدين\n• جودة مضمونة\n• شهادات متاحة\n\nلا تقليد أبداً!',
      gift: '🎀 تغليف الهدايا:\n\n✅ تغليف فاخر مجاني\n✅ بطاقة تهنئة مرفقة\n✅ تغليف أنيق\n\nاذكره في ملاحظات الطلب!'
    }
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    const welcomeText = lang === 'en' 
      ? 'Great! I will assist you in English. Choose a topic:'
      : 'رائع! سأساعدك بالعربية. اختر موضوع:';
    
    addMessage(welcomeText, 'bot');
    setShowQuickReplies(true);
  };

  const handleQuickReply = (replyId) => {
    const allReplies = [...quickReplies[language], ...moreQuestions[language], ...evenMoreQuestions[language]];
    const reply = allReplies.find(r => r.id === replyId);
    if (!reply) return;

    addMessage(reply.text, 'user');

    if (replyId === 'more') {
      setTimeout(() => {
        addMessage(
          language === 'en' ? 'Here are more questions:' : 'إليك المزيد من الأسئلة:',
          'bot'
        );
      }, 500);
      return;
    }

    if (replyId === 'more2') {
      setTimeout(() => {
        addMessage(
          language === 'en' ? 'Additional questions:' : 'أسئلة إضافية:',
          'bot'
        );
      }, 500);
      return;
    }

    if (replyId === 'back') {
      setTimeout(() => {
        addMessage(
          language === 'en' ? 'Back to main menu. Choose a topic:' : 'العودة للقائمة الرئيسية. اختر موضوع:',
          'bot'
        );
      }, 500);
      return;
    }

    setTimeout(() => {
      const response = responses[language][replyId];
      if (response) {
        addMessage(response, 'bot');
      }
    }, 800);
  };

  const addMessage = (text, sender) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pb-16">
      {/* Header */}
      <div className="bg-black text-white p-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => navigate(-1)} className="hover:opacity-70">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="font-semibold">ZT AI Assistant</h1>
            <p className="text-xs text-gray-300">Online • Instant Reply</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                message.sender === 'user'
                  ? 'bg-black text-white rounded-br-none'
                  : 'bg-white text-black border border-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-xs whitespace-pre-line leading-relaxed">{message.text}</p>
              <p className={`text-[9px] mt-1 ${message.sender === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Language Selection */}
        {!language && messages.length > 0 && (
          <div className="flex justify-center gap-3 mt-4 animate-fadeIn">
            <button
              onClick={() => handleLanguageSelect('en')}
              className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => handleLanguageSelect('ar')}
              className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
            >
              🇪🇬 العربية
            </button>
          </div>
        )}

        {/* Quick Replies */}
        {language && showQuickReplies && (
          <div className="flex flex-col gap-2 mt-4 animate-fadeIn">
            {(messages[messages.length - 1]?.text.includes('Additional') || messages[messages.length - 1]?.text.includes('إضافية')
              ? evenMoreQuestions[language]
              : messages[messages.length - 1]?.text.includes('more') || messages[messages.length - 1]?.text.includes('المزيد')
              ? moreQuestions[language]
              : quickReplies[language]
            ).map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReply(reply.id)}
                className="bg-white border border-gray-300 hover:border-black text-left px-4 py-2.5 rounded-lg transition-all hover:shadow-md text-xs font-medium text-gray-700 hover:text-black"
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIChat;
