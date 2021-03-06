import { TableStateShape } from "@redux/common/table/types";

export interface BooksState extends TableStateShape {}

export interface Book {    
    key: string;
    _id: string,
    name: string; 
    author: string;
    cost: number;
    genre: string;
    url: string;    
}

export interface Pagination {
    pageSize: number;
    current: number;
    total?: number;
}