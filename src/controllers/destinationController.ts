const Destination = require('../destinations.json');
import { BKTree } from "@picosearch/bk-tree";
import { Request, Response } from 'express';

interface DestinationType {
       term: string;
       uid: string;
       lat: number;
       lng: number;
       type: string;
       state?: string;
}

const options: DestinationType[] = (Array.isArray(Destination) ? Destination : Object.values(Destination)).map((d: any) => ({
       ...d,
       state: typeof d.state === "string" ? d.state : "",
}));

const tokenizedOptions = options.map((option) => (option.term || "").match(/\w+/g) || []);
const Common_typos = new Set(tokenizedOptions.flat().filter((word) => word.length > 3));

const correcter = new BKTree();

for (const item of Common_typos) {
       correcter.insert(item);
}

export const getSearchResult = async (req: Request, res: Response): Promise<void> => {
  const search_term = req.params.term
  let corrected = correcter.lookup(search_term);
  if (corrected == null) {
  corrected= "" // Now safe, corrected can't be null here
       }
  const filteredOptions = options.filter((i) => i.term && (i.term.toLowerCase().includes(search_term.toLowerCase()) || i.term.toLowerCase().includes(corrected.toLowerCase())));  
  const uniqueOptions = Array.from(new Map(filteredOptions.map((item) => [item.term, item])).values());
  res.status(200).json(uniqueOptions );
  return;
};


