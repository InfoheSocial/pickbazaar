// import { sendMail } from 'helpers/nodemailer';
async function createOrder(data) {
  if (
    !(
      process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_SPREADSHEET_ID_PRODUCT
    )
  ) {
    throw new Error(
      'GOOGLE credentials must be set as env vars `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL` ,`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` and `GOOGLE_SPREADSHEET_ID_PRODUCT`.'
    );
  }

  const { GoogleSpreadsheet } = require('google-spreadsheet');
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID_PRODUCT);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  });
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]

  // append rows
  await sheet.addRow(data);
}
export default async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { name,category_ids,listofitems,description,image,price } = req.body;
    try {
      await createOrder({
        name,category_ids,listofitems,description,image,price
      });
      // await sendMail('support@redq.io', email, 'Order Received By Medsy', {
      //   items,
      //   bill_amount,
      // });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
    return res.status(200).json({ message: `successfully added new order` });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
};
