import {Account, Client} from 'appwrite';
import React, {useState} from "react";

export const client = new Client();

client
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1') // e.g. https://fra.cloud.appwrite.io/v1
    .setProject("68e26c92003907cabe5c");

export const account = new Account(client);
export { ID } from 'appwrite';


