import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create CSV template based on PDR_BUYERS_template.csv
    const csvContent = `buyerid,csvid,status,bname,bstreet,bcity,bstate,bzip,bssn,bphone1,bphone2,bemail,bpaypalemail,bownershiptype,notes,phone_key,btype,btag1,btag2,btag3,lsource,datecr,bnotes,useridcr,audited,buyer_street,buyer_city,buyer_zip,buyer_state,bneighborhood,investment_goals,property_notes,bcounties,archived,offer_accepted,terminated_reason,terminated_user,terminated_date,sent_comm
,1,active,John Doe,123 Main St,Chicago,IL,60601,,555-123-4567,,john.doe@email.com,,individual,First time buyer,,,,individual,single_family,,,import,2024-01-01,Looking for single family homes,user1,false,123 Main St,Chicago,60601,IL,Downtown,100k-250k,Prefers turnkey properties,Cook County,false,false,,,,
,2,active,Jane Smith,456 Oak Ave,Los Angeles,CA,90210,,555-987-6543,,jane.smith@email.com,,company,Investment company,,,,company,multi_family,commercial,,,import,2024-01-01,Looking for investment properties,user1,false,456 Oak Ave,Los Angeles,90210,CA,Beverly Hills,250k-500k,Prefers multi-family and commercial,Cook County,false,false,,,,
,3,active,Bob Johnson,789 Pine St,New York,NY,10001,,555-456-7890,,bob.johnson@email.com,,investor,Experienced investor,,,,investor,single_family,land,,,import,2024-01-01,Looking for land and single family,user1,false,789 Pine St,New York,10001,NY,Manhattan,500k+,Prefers land and single family homes,Cook County,false,false,,,,`;

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="buyer_import_template.csv"');
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

    // Send the CSV content
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
}
