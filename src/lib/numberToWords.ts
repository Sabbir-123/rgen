/**
 * Converts numbers into English words (Taka)
 */
export function numberToWordsEnglish(num: number): string {
  if (num === 0) return "Zero Taka Only.";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return "";
    
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    
    if (n > 0) {
      str += ones[n] + " ";
    }
    
    return str.trim();
  };

  let result = "";
  let integerPart = Math.floor(num);
  let paisaPart = Math.round((num - integerPart) * 100);

  if (integerPart >= 10000000) { // Crore
    const crore = Math.floor(integerPart / 10000000);
    result += numberToWordsEnglish(crore).replace(" Taka Only.", "") + " Crore ";
    integerPart %= 10000000;
  }

  if (integerPart >= 100000) { // Lakh
    const lakh = Math.floor(integerPart / 100000);
    result += convertLessThanOneThousand(lakh) + " Lakh ";
    integerPart %= 100000;
  }

  if (integerPart >= 1000) { // Thousand
    const thousand = Math.floor(integerPart / 1000);
    result += convertLessThanOneThousand(thousand) + " Thousand ";
    integerPart %= 1000;
  }

  if (integerPart > 0) {
    result += convertLessThanOneThousand(integerPart);
  }

  result = result.trim() + " Taka";

  if (paisaPart > 0) {
    result += " and " + convertLessThanOneThousand(paisaPart) + " Paisa";
  }

  return result + " Only.";
}

/**
 * Converts numbers into Bengali words (টাকা)
 */
export function numberToWordsBengali(num: number): string {
  if (num === 0) return "শূন্য টাকা মাত্র।";

  const ones = [
    "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
    "এগারো", "বারো", "তেরো", "চোদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ",
    "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটাশ", "ঊনত্রিশ", "ত্রিশ",
    "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
    "একচল্লিশ", "বেয়াল্লিশ", "তেতাল্লিশ", "চৌয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
    "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
    "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
    "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চৌহাত্তর", "পঁচাত্তর", "ছেয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি",
    "একাশি", "বিরাশি", "তিরাশি", "চৌরাশি", "পঁচাশি", "ছেয়াশি", "সাতাশি", "অষ্টাশি", "ঊননব্বই", "নব্বই",
    "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চৌরানব্বই", "পঁচানব্বই", "ছেয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
  ];

  const convertLessThanOneThousandBengali = (n: number): string => {
    if (n === 0) return "";
    let str = "";
    if (n >= 100) {
      const hundreds = Math.floor(n / 100);
      if (hundreds === 1) {
        str += "একশত ";
      } else {
        str += ones[hundreds] + "শত ";
      }
      n %= 100;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  };

  let result = "";
  let integerPart = Math.floor(num);
  let paisaPart = Math.round((num - integerPart) * 100);

  if (integerPart >= 10000000) { // কোটি
    const crore = Math.floor(integerPart / 10000000);
    result += numberToWordsBengali(crore).replace(" টাকা মাত্র।", "") + " কোটি ";
    integerPart %= 10000000;
  }

  if (integerPart >= 100000) { // লাখ
    const lakh = Math.floor(integerPart / 100000);
    result += ones[lakh] + " লাখ ";
    integerPart %= 100000;
  }

  if (integerPart >= 1000) { // হাজার
    const thousand = Math.floor(integerPart / 1000);
    result += ones[thousand] + " হাজার ";
    integerPart %= 1000;
  }

  if (integerPart > 0) {
    result += convertLessThanOneThousandBengali(integerPart);
  }

  result = result.trim() + " টাকা";

  if (paisaPart > 0) {
    result += " এবং " + ones[paisaPart] + " পয়সা";
  }

  return result + " মাত্র।";
}

/**
 * Main wrapper to support languages
 */
export function amountToWords(amount: number, language: "en" | "bn" = "en"): string {
  return language === "bn" ? numberToWordsBengali(amount) : numberToWordsEnglish(amount);
}
