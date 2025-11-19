using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTO
{
    public class PrecoDTO
    {
        public required double Valor { get; set; }
        public required string CodigoCacamba { get; set; }
    }
}