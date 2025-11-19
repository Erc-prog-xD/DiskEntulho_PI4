using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;

namespace backend.Models
{
    public class Preco
    {
        public int Id { get; set; }
        public double Valor { get; set; }
        public required Cacamba codigoCacamba { get; set; }
    }
}